import { NextResponse, type NextRequest } from "next/server";

import { developmentSessionCookie, hasValidDevelopmentSession } from "@/lib/auth/development-session";
import { updateSession } from "@/lib/supabase/middleware";

const protectedRoutePrefixes = ["/admin", "/exhibit", "/org", "/organizer", "/account"];

function isProtectedRoute(pathname: string): boolean {
  return /\/e\/[^/]+\/saved(?:\/|$)/.test(pathname) || protectedRoutePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/organizer" || request.nextUrl.pathname.startsWith("/organizer/")) {
    if (await hasValidDevelopmentSession(request.cookies.get(developmentSessionCookie.name)?.value)) {
      return NextResponse.next();
    }
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  const { claims, response } = await updateSession(request);

  if (isProtectedRoute(request.nextUrl.pathname) && !claims) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth";
    redirectUrl.search = "";
    redirectUrl.searchParams.set(
      "next",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );

    const redirectResponse = NextResponse.redirect(redirectUrl);
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    ["cache-control", "expires", "pragma"].forEach((name) => {
      const value = response.headers.get(name);
      if (value) {
        redirectResponse.headers.set(name, value);
      }
    });

    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2)$).*)",
  ],
};
