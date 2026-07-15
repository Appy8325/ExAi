import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getApiBaseUrl } from "@/lib/api/config";
import { getSupabasePublicConfig } from "@/lib/supabase/config";

export async function GET(request: NextRequest) {
  const next = request.nextUrl.searchParams.get("next");
  const fallback = isLocalPath(next) ? next : "/demo";
  const response = NextResponse.redirect(new URL(fallback, request.url));
  const code = request.nextUrl.searchParams.get("code");
  if (!code) return response;

  const { url, publishableKey } = getSupabasePublicConfig();
  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.session) return response;

  const completion = await fetch(`${getApiBaseUrl()}/v1/public/enroll/complete`, {
    method: "POST",
    headers: { authorization: `Bearer ${data.session.access_token}` },
    cache: "no-store",
  });
  if (!completion.ok) return response;

  const relationship = (await completion.json()) as { eventExhibitorId: string };
  response.headers.set(
    "location",
    new URL(`/visit/${relationship.eventExhibitorId}?connected=1`, request.url).toString(),
  );
  return response;
}

function isLocalPath(value: string | null): value is string {
  return Boolean(value?.startsWith("/") && !value.startsWith("//"));
}
