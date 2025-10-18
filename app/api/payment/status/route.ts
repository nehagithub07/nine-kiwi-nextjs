import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { Payment } from "@/models/Payment";

export async function GET(req: NextRequest) {
  let paid = req.cookies.get("nk_has_paid")?.value === "true";
  try {
    const session = await getServerSession(authOptions);
    const email = (session?.user as any)?.email;
    if (email) {
      await dbConnect();
      const count = await Payment.countDocuments({ email: String(email).toLowerCase(), status: "success" });
      if (count > 0) paid = true;
    }
  } catch {}
  const res = NextResponse.json({ paid });
  try {
    const isHttps = req.nextUrl.protocol === "https:";
    if (paid && req.cookies.get("nk_has_paid")?.value !== "true") {
      res.cookies.set("nk_has_paid", "true", {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        secure: isHttps,
      });
    }
  } catch {}
  return res;
}
