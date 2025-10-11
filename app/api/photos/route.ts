// app/api/photos/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Photo } from "@/models/Photo";
import { cloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";       // ✅ Cloudinary needs Node runtime
export const dynamic = "force-dynamic"; // ✅ always dynamic (no caching of DB queries)

type Query = {
  reportId?: string;
  section?: string;
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reportId = searchParams.get("reportId") || undefined;
    const section = searchParams.get("section") || undefined;

    await connectDB();

    const query: Query = {};
    if (reportId) query.reportId = reportId;
    if (section) query.section = section;

    const items = await Photo.find(query).sort({ createdAt: -1 });
    return NextResponse.json(items, { status: 200 });
  } catch (err: any) {
    console.error("[GET /api/photos] error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to list photos" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const {
      name,
      data,
      reportId,
      section,
      includeInSummary,
      caption,
      description,
      figureNumber,
    } = body as {
      name?: string;
      data?: string; // dataURL or http(s)
      reportId?: string;
      section?: string;
      includeInSummary?: boolean;
      caption?: string;
      description?: string;
      figureNumber?: number;
    };

    if (!name || !data) {
      return NextResponse.json(
        { error: "name and data are required" },
        { status: 400 }
      );
    }

    // Optional but recommended: group by report/section
    if (!reportId) {
      return NextResponse.json(
        { error: "reportId is required to persist photos" },
        { status: 400 }
      );
    }

    await connectDB();

    const isDataURL = typeof data === "string" && data.startsWith("data:");
    const isHttpUrl = typeof data === "string" && /^https?:\/\//i.test(data);

    let src = data as string;

    // Upload only if it's a data URL or a remote URL; otherwise assume it's already a Cloudinary URL
    if (isDataURL || isHttpUrl) {
      const uploaded = await cloudinary.uploader.upload(data, {
        folder: "ninekiwi/photos",
        resource_type: "image",
        overwrite: false,
        // You can add public_id if you want deterministic names:
        // public_id: `${reportId}/${Date.now()}_${Math.random().toString(36).slice(2)}`,
      });
      src = uploaded.secure_url;
    }

    const created = await Photo.create({
      name,
      src,
      reportId,
      section,
      includeInSummary: !!includeInSummary,
      caption,
      description,
      figureNumber,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/photos] error:", err);
    return NextResponse.json(
      { error: err?.message || "Upload failed" },
      { status: 500 }
    );
  }
}
