import { NextRequest, NextResponse } from "next/server";

/**
 * Session cookie name used by Better Auth.
 * Default prefix is "better-auth", making the session cookie "better-auth.session_token".
 * The "__Secure-" prefix is added in production (HTTPS). We check both.
 */
const SESSION_COOKIE_NAMES = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
];

// Paths that are always public — no session required
const PUBLIC_PREFIXES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/api/auth",
  "/_next",
  "/favicon.ico",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/") || pathname.startsWith(prefix + "?")
  );
}

function hasSessionCookie(request: NextRequest): boolean {
  return SESSION_COOKIE_NAMES.some((name) => Boolean(request.cookies.get(name)?.value));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always pass through public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // If no session cookie, redirect to login
  if (!hasSessionCookie(request)) {
    const loginUrl = new URL("/login", request.url);
    const callbackUrl = `${pathname}${request.nextUrl.search}`;
    loginUrl.searchParams.set("callbackUrl", callbackUrl);
    return NextResponse.redirect(loginUrl);
  }

  // Session cookie is present — let the Server Component layout do
  // the full auth + role verification (it runs in Node.js, not Edge).
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimisation)
     * - favicon.ico
     * - public image assets
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
