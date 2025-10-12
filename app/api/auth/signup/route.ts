import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import { User } from "@/models/User";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { name, email, password, adminKey } = (await req.json()) as {
      name?: string;
      email?: string;
      password?: string;
      adminKey?: string;
    };

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 409 });

    const passwordHash = await bcrypt.hash(password, 10);
    const existingCount = await User.countDocuments();
    const role: "user" | "admin" = existingCount === 0
      ? "admin"
      : adminKey && adminKey === process.env.ADMIN_SIGNUP_KEY
        ? "admin"
        : "user";

    const user = await User.create({ name, email: email.toLowerCase(), passwordHash, role });

    return NextResponse.json({ success: true, user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role } });
  } catch (err: any) {
    console.error("Signup error", err);
    const msg = err?.message || String(err);
    if (/ECONN|ETIMEOUT|ENOTFOUND|ServerSelection|bad auth|authentication failed/i.test(msg)) {
      return NextResponse.json({ error: "Database unavailable", details: msg }, { status: 503 });
    }
    // Duplicate email safety (in case of race with existing check)
    if (err?.code === 11000 || /duplicate key/i.test(msg)) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
