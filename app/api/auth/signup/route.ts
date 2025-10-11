import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";


export async function POST(req: Request) {
try {
const { name, email, password } = await req.json();
if (!name || !email || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });


await connectDB();
const existing = await User.findOne({ email });
if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 409 });


const passwordHash = await bcrypt.hash(password, 12);
const user = await User.create({ name, email, passwordHash });


return NextResponse.json({ id: user._id, name: user.name, email: user.email, role: user.role });
} catch (err: any) {
return NextResponse.json({ error: err.message || "Signup failed" }, { status: 500 });
}
}