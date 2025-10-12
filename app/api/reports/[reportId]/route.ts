import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { dbConnect } from "@/lib/mongodb";
import { Report } from "@/models/Report";

export async function GET(_req: NextRequest, { params }: { params: { reportId: string } }) {
  const session = await getServerSession(authOptions as any);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id as string;
  await dbConnect();
  const doc = await Report.findOne({ userId, reportId: params.reportId }).lean();
  if (!doc) return NextResponse.json({ item: null }, { status: 200 });
  return NextResponse.json({ item: doc });
}

export async function PATCH(req: NextRequest, { params }: { params: { reportId: string } }) {
  const session = await getServerSession(authOptions as any);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id as string;
  const body = await req.json();
  await dbConnect();
  const update: any = {};
  if (body?.data) update.data = body.data;
  if (typeof body?.signatureData !== "undefined") update.signatureData = body.signatureData;
  if (typeof body?.status === "string") update.status = body.status;
  const doc = await Report.findOneAndUpdate({ userId, reportId: params.reportId }, { $set: update }, { new: true }).lean();
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ item: doc });
}

export async function DELETE(_req: NextRequest, { params }: { params: { reportId: string } }) {
  const session = await getServerSession(authOptions as any);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id as string;
  await dbConnect();
  await Report.findOneAndDelete({ userId, reportId: params.reportId });
  return NextResponse.json({ ok: true });
}

