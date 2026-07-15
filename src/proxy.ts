import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Kept as a literal (not imported from lib/auth/session) — proxy should not
// pull in shared server modules/DB bindings into its own bundle.
const SESSION_COOKIE = "ooty_session";

// Cheap first gate for /admin/**: bounce straight to /admin/login when there's
// no session cookie at all, so unauthenticated requests never even reach the
// page render. This is NOT the real authorization check — every admin page
// and Server Action re-verifies the session + role server-side (a proxy
// matcher change here must never become the only guard).
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  const hasSession = request.cookies.has(SESSION_COOKIE);
  if (!hasSession) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
