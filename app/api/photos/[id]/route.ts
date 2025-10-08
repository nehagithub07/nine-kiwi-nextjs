// app/api/photos/[id]/route.ts
import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import { Photo } from "@/models/Photo";

type Params = { params: { id: string } };

export async function PATCH(req: Request, { params }: Params) {
  try {
    await connectToDB();
    const body = await req.json();

    const updated = await Photo.findByIdAndUpdate(
      params.id,
      {
        $set: {
          ...(body.name !== undefined ? { name: String(body.name) } : {}),
          ...(body.src !== undefined ? { src: String(body.src) } : {}),
          ...(body.includeInSummary !== undefined ? { includeInSummary: !!body.includeInSummary } : {}),
          ...(body.caption !== undefined ? { caption: String(body.caption) } : {}),
          ...(body.description !== undefined ? { description: String(body.description) } : {}),
          ...(body.figureNumber !== undefined ? { figureNumber: Number(body.figureNumber) } : {}),
          ...(body.section !== undefined ? { section: String(body.section) } : {}),
        },
      },
      { new: true }
    ).lean();

    if (!updated) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true, item: updated });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    await connectToDB();
    const res = await Photo.findByIdAndDelete(params.id);
    if (!res) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
