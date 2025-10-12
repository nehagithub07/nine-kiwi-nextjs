import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Report from "@/models/Report";
import Photo from "@/models/Photo";

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const { formData, photos } = body as {
      formData: Record<string, any>;
      photos: Array<{
        name?: string;
        data?: string;
        url?: string;
        caption?: string;
        section?: string;
        includeInSummary?: boolean;
        figureNumber?: number;
        description?: string;
      }>;
    };

    // Create report (Mongoose will ignore unknown fields not in schema)
    const report = await Report.create({ ...formData });

    // Save photos referencing this report
    if (Array.isArray(photos) && photos.length > 0) {
      const docs = photos.map((p) => ({
        reportId: report._id,
        name: p.name ?? "",
        data: p.data ?? p.url ?? "",
        url: p.url,
        caption: p.caption ?? p.name ?? "",
        section: p.section ?? "fieldObservation",
        includeInSummary: typeof p.includeInSummary === "boolean" ? p.includeInSummary : undefined,
        figureNumber: typeof p.figureNumber === "number" ? p.figureNumber : undefined,
        description: p.description,
      }));
      if (docs.length) await Photo.insertMany(docs);
    }

    return NextResponse.json({ success: true, reportId: report._id.toString() });
  } catch (error) {
    console.error("Error saving report:", error);
    return NextResponse.json(
      { error: "Failed to save report" },
      { status: 500 }
    );
  }
}
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
