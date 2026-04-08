import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

const protectedPrefix = "/admin";
const architectOnlyPrefix = "/admin/users";
const loginPath = "/login";
const defaultAuthenticatedPath = "/admin";

function getSafeRedirectPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return defaultAuthenticatedPath;
  }

  return value;
}

function buildLoginRedirect(request: NextRequest) {
  const loginUrl = new URL(loginPath, request.url);
  const requestedPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  if (request.nextUrl.pathname.startsWith(protectedPrefix)) {
    loginUrl.searchParams.set("redirectTo", requestedPath);
  }

  return loginUrl;
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtectedRoute = pathname.startsWith(protectedPrefix);
  const isLoginRoute = pathname === loginPath;

  let session = null;

  try {
    session = await auth.api.getSession({
      headers: request.headers,
    });
  } catch (error) {
    console.error("[proxy] session lookup failed", error);
  }

  if (!session?.user && isProtectedRoute) {
    return NextResponse.redirect(buildLoginRedirect(request));
  }

  if (
    session?.user &&
    pathname.startsWith(architectOnlyPrefix) &&
    session.user.role !== "architect"
  ) {
    return NextResponse.redirect(new URL(defaultAuthenticatedPath, request.url));
  }

  if (session?.user && isLoginRoute) {
    const redirectTo = getSafeRedirectPath(request.nextUrl.searchParams.get("redirectTo"));
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
