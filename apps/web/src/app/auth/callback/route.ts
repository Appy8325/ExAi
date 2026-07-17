import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { getApiBaseUrl } from "@/lib/api/config";
import { getSupabasePublicConfig } from "@/lib/supabase/config";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const requestedNext = url.searchParams.get("next");
  const fallback = isLocalPath(requestedNext) ? requestedNext : "/demo";
  const errorDescription = url.searchParams.get("error_description");

  const redirectTarget = errorDescription
    ? buildAuthUrl(request.nextUrl.origin, { error_description: errorDescription, next: fallback })
    : fallback;

  const response = NextResponse.redirect(new URL(redirectTarget, request.nextUrl.origin));
  await persistSession(request, response, code, tokenHash, type);

  return response;
}

function buildAuthUrl(origin: string, params: Record<string, string>) {
  const target = new URL("/auth", origin);
  for (const [key, value] of Object.entries(params)) {
    if (value) target.searchParams.set(key, value);
  }
  return `${target.pathname}${target.search}`;
}

async function persistSession(
  request: NextRequest,
  response: NextResponse,
  code: string | null,
  tokenHash: string | null,
  type: string | null,
) {
  if (!code && !(tokenHash && type)) return;

  let env: { url: string; publishableKey: string };
  try {
    env = getSupabasePublicConfig();
  } catch {
    return;
  }

  const supabase = createServerClient(env.url, env.publishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return;
    await completeEnrollment(request, response, supabase);
    return;
  }

  if (tokenHash && type) {
    await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as never });
  }
}

async function completeEnrollment(
  request: NextRequest,
  response: NextResponse,
  supabase: ReturnType<typeof createServerClient>,
) {
  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;
    const completion = await fetch(`${getApiBaseUrl()}/v1/public/enroll/complete`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!completion.ok) return;

    const relationship = (await completion.json()) as { eventExhibitorId?: string };
    if (relationship.eventExhibitorId) {
      response.headers.set(
        "location",
        new URL(`/visit/${relationship.eventExhibitorId}?connected=1`, request.nextUrl.origin).toString(),
      );
    }
  } catch {
    /* best effort */
  }
}

function isLocalPath(value: string | null): value is string {
  return Boolean(value?.startsWith("/") && !value.startsWith("//"));
}
