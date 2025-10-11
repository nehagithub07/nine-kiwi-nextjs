import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";        // Cloud/Node features OK
export const dynamic = "force-dynamic"; // don't cache this route

export async function POST(req: Request) {
  try {
    // 1) Parse & basic validate
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    let { name, email, password } = body as {
      name?: string;
      email?: string;
      password?: string;
    };

    name = (name || "").trim();
    email = (email || "").trim().toLowerCase();
    const pwd = (password || "").trim();

    if (!name || !email || !pwd) {
      return NextResponse.json(
        { error: "name, email and password are required" },
        { status: 400 }
      );
    }

    // Optional: super lightweight password gate
    if (pwd.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // 2) Connect DB
    await connectDB();

    // 3) Check for existing email
    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );
    }

    // 4) Hash password & create user
    const passwordHash = await bcrypt.hash(pwd, 12);
    const user = await User.create({
      name,
      email,
      passwordHash,
      // role defaults to "user", avatarUrl optional
    });

    // 5) Return public fields only (no passwordHash)
    return NextResponse.json(
      {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl || null,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("[POST /api/auth/signup] error:", err);
    return NextResponse.json(
      { error: err?.message || "Signup failed" },
      { status: 500 }
    );
  }
}
