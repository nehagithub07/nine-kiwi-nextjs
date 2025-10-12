import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import connectDB from "@/lib/db";
import Report from "@/models/Report";
import Photo from "@/models/Photo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // ✅ Use req.cookies (not cookies())
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken<{ role?: string }>(token);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    // 🔹 Fetch all reports (latest first)
    const reports = await Report.find({})
      .sort({ createdAt: -1 })
      .lean();

    // 🔹 Fetch photos in parallel for efficiency
    const reportsWithPhotos = await Promise.all(
      reports.map(async (report) => {
        const photos = await Photo.find({ reportId: report._id }).lean();

        return {
          id: report._id?.toString(),
          reportId: report.reportId || "",
          status: report.status || "",
          inspectorName: report.inspectorName || "",
          clientName: report.clientName || "",
          companyName: report.companyName || "",
          location: report.location || "",
          streetAddress: report.streetAddress || "",
          city: report.city || "",
          state: report.state || "",
          country: report.country || "",
          zipCode: report.zipCode || "",
          inspectionDate: report.inspectionDate || "",
          startInspectionTime: report.startInspectionTime || "",
          contactEmail: report.contactEmail || "",
          contactPhone: report.contactPhone || "",
          photoCount: photos.length,
          createdAt: report.createdAt,
          photos: photos.map((photo) => ({
            id: photo._id?.toString(),
            url: photo.data || photo.url,
            caption: photo.caption || photo.name || "",
            section: photo.section || "fieldObservation",
          })),
        };
      })
    );

    return NextResponse.json(reportsWithPhotos);
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
