import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import { User } from "@/models/User";
import { signToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, password } = (await req.json()) as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const token = signToken({ sub: user._id.toString(), email: user.email, role: user.role });

    const res = NextResponse.json({ success: true, user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role } });
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (err: any) {
    console.error("Login error", err);
    const msg = err?.message || String(err);
    if (/ECONN|ETIMEOUT|ENOTFOUND|ServerSelection|bad auth|authentication failed/i.test(msg)) {
      return NextResponse.json({ error: "Database unavailable", details: msg }, { status: 503 });
    }
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
