import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

const protectedRoutePrefixes = ["/admin", "/exhibit", "/org", "/account"];

function isProtectedRoute(pathname: string): boolean {
  return /\/e\/[^/]+\/saved(?:\/|$)/.test(pathname) || protectedRoutePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/organizer" || pathname.startsWith("/organizer/")) {
    const rewritten = pathname.replace(/^\/organizer/, "/org");
    const url = request.nextUrl.clone();
    url.pathname = rewritten;
    return NextResponse.redirect(url, 308);
  }

  const { claims, response } = await updateSession(request);

  if (isProtectedRoute(pathname) && !claims) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth";
    redirectUrl.search = "";
    redirectUrl.searchParams.set(
      "next",
      `${pathname}${request.nextUrl.search}`,
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
