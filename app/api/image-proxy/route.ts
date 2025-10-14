import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl.searchParams.get("url");
    if (!url || !/^https?:\/\//i.test(url)) {
      return NextResponse.json({ error: "Invalid url" }, { status: 400 });
    }
    const r = await fetch(url, {
      // some providers require a UA; also prevent caching issues
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        Referer: req.headers.get("referer") || "https://ninekiwi.com/",
      },
      cache: "no-store",
    });
    if (!r.ok) return NextResponse.json({ error: `upstream ${r.status}` }, { status: r.status });
    const contentType = r.headers.get("content-type") || "application/octet-stream";
    const arrBuf = await r.arrayBuffer();
    return new NextResponse(arrBuf, {
      headers: { "content-type": contentType, "cache-control": "no-store" },
      status: 200,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "proxy failed" }, { status: 500 });
  }
}

