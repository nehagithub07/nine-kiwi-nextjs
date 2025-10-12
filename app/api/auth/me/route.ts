import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const token = cookies().get("token")?.value;
    if (!token) return NextResponse.json({ user: null }, { status: 200 });
    const payload = verifyToken<{ sub?: string; email?: string; role?: string }>(token);
    return NextResponse.json({
      user: {
        id: payload.sub || null,
        email: payload.email || null,
        role: payload.role || null,
      },
    });
  } catch {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}

