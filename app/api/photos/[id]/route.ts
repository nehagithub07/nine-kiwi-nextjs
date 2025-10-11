import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Photo } from "@/models/Photo";


export async function GET(_req: Request, { params }: { params: { id: string } }) {
await connectDB();
const item = await Photo.findById(params.id);
if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
return NextResponse.json(item);
}


export async function PATCH(req: Request, { params }: { params: { id: string } }) {
try {
await connectDB();
const updates = await req.json();
const item = await Photo.findByIdAndUpdate(params.id, updates, { new: true });
if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
return NextResponse.json(item);
} catch (err: any) {
return NextResponse.json({ error: err.message }, { status: 500 });
}
}


export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
await connectDB();
await Photo.findByIdAndDelete(params.id);
return NextResponse.json({ ok: true });
}