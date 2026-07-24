import { NextResponse } from "next/server";

import { createDevelopmentSession, developmentSessionCookie, hasValidDevelopmentCredentials } from "@/lib/auth/development-session";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { email?: unknown; password?: unknown } | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!hasValidDevelopmentCredentials(email, password)) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(developmentSessionCookie.name, await createDevelopmentSession(), developmentSessionCookie.options);
  return response;
}

export function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(developmentSessionCookie.name, "", { ...developmentSessionCookie.options, maxAge: 0 });
  return response;
}
