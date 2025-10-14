import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const paid = req.cookies.get("nk_has_paid")?.value === "true";
  return NextResponse.json({ paid });
}

