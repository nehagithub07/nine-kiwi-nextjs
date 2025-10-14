import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { orderId, paymentId, signature } = await req.json();
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) {
      return NextResponse.json(
        { error: "Razorpay secret not configured" },
        { status: 500 }
      );
    }
    if (!orderId || !paymentId || !signature) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const expected = crypto
      .createHmac("sha256", key_secret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const valid = expected === signature;
    if (!valid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const res = NextResponse.json({ success: true });
    const isHttps = req.nextUrl.protocol === "https:";
    res.cookies.set("nk_has_paid", "true", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      secure: isHttps,
    });
    return res;
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Verification failed" },
      { status: 500 }
    );
  }
}
