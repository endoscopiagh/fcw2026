import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { ADMIN_ROUTE_PREFIX, AUTH_COOKIE_NAME, DEFAULT_LOGGED_ROUTE, LOGIN_ROUTE, PRIVATE_ROUTE_PREFIXES } from "@/lib/constants/tournament";
import { verifySessionToken } from "@/lib/auth/session";

function isPrivateRoute(pathname: string): boolean {
  return PRIVATE_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? verifySessionToken(token) : null;

  if (isPrivateRoute(pathname) && !session) {
    return NextResponse.redirect(new URL(LOGIN_ROUTE, request.url));
  }

  if (pathname.startsWith(ADMIN_ROUTE_PREFIX) && session?.role !== "admin") {
    return NextResponse.redirect(new URL(DEFAULT_LOGGED_ROUTE, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
