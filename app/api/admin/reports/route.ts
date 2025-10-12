import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { dbConnect } from "@/lib/mongodb";
import { Report } from "@/models/Report";
import { User } from "@/models/User";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions as any);
  const role = (session?.user as any)?.role;
  if (!session || role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId") || undefined;
  const reportId = searchParams.get("reportId") || undefined;

  await dbConnect();
  const q: any = {};
  if (userId) q.userId = userId;
  if (reportId) q.reportId = reportId;
  const reports = await Report.find(q).sort({ updatedAt: -1 }).lean();
  const userIds = Array.from(new Set(reports.map((r) => r.userId)));
  const users = await User.find({ _id: { $in: userIds } }, { password: 0 }).lean();
  const userMap = new Map(users.map((u) => [String(u._id), u]));
  const items = reports.map((r) => ({
    ...r,
    user: userMap.get(String(r.userId)) || null,
  }));
  return NextResponse.json({ items });
}

