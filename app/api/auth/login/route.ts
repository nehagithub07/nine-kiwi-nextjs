import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/jwt";


export async function POST(req: Request) {
try {
const { email, password } = await req.json();
if (!email || !password) return NextResponse.json({ error: "Missing credentials" }, { status: 400 });


await connectDB();
const user = await User.findOne({ email });
if (!user) return NextResponse.json({ error: "Invalid email/password" }, { status: 401 });


const ok = await bcrypt.compare(password, user.passwordHash);
if (!ok) return NextResponse.json({ error: "Invalid email/password" }, { status: 401 });


const token = signToken({ uid: String(user._id), role: user.role });


const res = NextResponse.json({
id: user._id,
name: user.name,
email: user.email,
role: user.role,
});


res.cookies.set("token", token, {
httpOnly: true,
path: "/",
sameSite: "lax",
secure: true,
maxAge: 60 * 60 * 24 * 7,
});


return res;
} catch (err: any) {
return NextResponse.json({ error: err.message || "Login failed" }, { status: 500 });
}
}