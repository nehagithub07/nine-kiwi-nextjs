import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session || role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await dbConnect();
  const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ users });
}
