// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Pages protégées (redirection vers login si pas de JWT)
const protectedRoutes = ["/home", "/profile", "/messages", "/groups", "/contact", "/post"];

export function middleware(req: NextRequest) {
  const jwt = req.cookies.get("jwt")?.value;
  const { pathname } = req.nextUrl;

  // Redirection pour les pages protégées si JWT absent
  if (!jwt && protectedRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/home/:path*",
    "/profile/:path*",
    "/messages/:path*",
    "/groups/:path*",
    "/contact/:path*",
	"/post/:path*"
  ],
};
