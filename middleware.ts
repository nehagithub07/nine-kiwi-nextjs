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

  // Require login for /pay; if already paid, send to /report
  if (pathname === "/pay") {
    let token: any = null;
    try { token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET }); } catch {}
    if (!token) {
      const url = new URL("/login", req.url);
      url.searchParams.set("callbackUrl", "/pay");
      return NextResponse.redirect(url);
    }
    const paid = req.cookies.get("nk_has_paid")?.value === "true";
    if (paid) {
      return NextResponse.redirect(new URL("/report", req.url));
    }
  }

  // Public pages bypass auth
  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next();

  // Require login for report tool
  if (pathname === "/report" || pathname.startsWith("/report/")) {
    let token: any = null;
    try { token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET }); } catch {}
    if (!token) return NextResponse.redirect(new URL("/login?callbackUrl=" + encodeURIComponent(req.nextUrl.pathname), req.url));
  }

  // Require login for account page
  if (pathname === "/account" || pathname.startsWith("/account/")) {
    let token: any = null;
    try { token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET }); } catch {}
    if (!token) return NextResponse.redirect(new URL("/login?callbackUrl=" + encodeURIComponent(req.nextUrl.pathname), req.url));
  }

  // Example: protect /admin only
  if (pathname.startsWith("/admin")) {
    let token: any = null;
    try { token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET }); } catch {}
    if (!token) return NextResponse.redirect(new URL("/login", req.url));
    const role = (token as any).role || "user";
    if (role !== "admin") return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = { matcher: [
  "/admin/:path*",
  "/report",
  "/report/:path*",
  "/account",
  "/account/:path*",
  "/pay"
] };
