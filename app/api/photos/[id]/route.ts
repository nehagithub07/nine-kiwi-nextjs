import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Photo } from "@/models/Photo";
import { cloudinary } from "@/lib/cloudinary";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function PATCH(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions as any);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await _req.json();
    const update: any = {};
    if (typeof body?.caption === "string") update.caption = body.caption;
    if (typeof body?.description === "string") update.description = body.description;
    if (typeof body?.includeInSummary === "boolean") update.includeInSummary = body.includeInSummary;
    if (typeof body?.figureNumber === "number") update.figureNumber = body.figureNumber;
    await dbConnect();
    const doc = await Photo.findByIdAndUpdate(params.id, update, { new: true }).lean();
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Update photo error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions as any);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await dbConnect();
    const doc = await Photo.findById(params.id);
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    // delete from Cloudinary first
    if (doc.publicId) {
      try {
        await cloudinary.uploader.destroy(doc.publicId);
      } catch (e) {
        console.warn("Cloudinary destroy failed", e);
      }
    }
    await Photo.findByIdAndDelete(params.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Delete photo error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

