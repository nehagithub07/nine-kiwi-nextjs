// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

const PUBLIC_PATHS = new Set([
  "/",              // optional, keep homepage public
  "/login",
  "/signup",
  "/admin/login",
  "/admin/signup",
]);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow API auth endpoints
  if (pathname.startsWith("/api/auth")) return NextResponse.next();

  // Public pages bypass auth
  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next();

  // Example: protect /admin only
  if (pathname.startsWith("/admin")) {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.redirect(new URL("/login", req.url));
    try {
      const payload = verifyToken<{ role: string }>(token);
      if (payload.role !== "admin") return NextResponse.redirect(new URL("/", req.url));
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
