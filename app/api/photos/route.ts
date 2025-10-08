// app/api/photos/route.ts
import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import { Photo } from "@/models/Photo";

export async function GET(req: Request) {
  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);
    const reportId = searchParams.get("reportId");
    const section = searchParams.get("section");

    const filter: any = {};
    if (reportId) filter.reportId = reportId;
    if (section) filter.section = section;

    const items = await Photo.find(filter).sort({ createdAt: 1 }).lean();
    return NextResponse.json({ ok: true, items });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDB();
    const body = await req.json();

    if (!body?.reportId || !body?.section || !body?.name) {
      return NextResponse.json({ ok: false, error: "reportId, section, name are required" }, { status: 400 });
    }

    const doc = await Photo.create({
      reportId: String(body.reportId),
      section:  String(body.section),
      name:     String(body.name),
      src:      body.src ? String(body.src) : undefined,
      includeInSummary: !!body.includeInSummary,
      caption:  body.caption ? String(body.caption) : undefined,
      description: body.description ? String(body.description) : undefined,
      figureNumber: typeof body.figureNumber === "number" ? body.figureNumber : undefined,
    });

    return NextResponse.json({ ok: true, item: doc });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
