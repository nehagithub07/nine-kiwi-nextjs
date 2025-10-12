// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = new Set([
  "/",              // optional, keep homepage public
  "/login",
  "/signup",
  "/admin/login",
  "/admin/signup",
]);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow API auth endpoints
  if (pathname.startsWith("/api/auth")) return NextResponse.next();

  // Public pages bypass auth
  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next();

  // Require login for report tool
  if (pathname === "/report" || pathname.startsWith("/report/")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.redirect(new URL("/login?callbackUrl=" + encodeURIComponent(req.nextUrl.pathname), req.url));
  }

  // Example: protect /admin only
  if (pathname.startsWith("/admin")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.redirect(new URL("/login", req.url));
    const role = (token as any).role || "user";
    if (role !== "admin") return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*", "/report", "/report/:path*"] };
