import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { User } from "@/models/User";
import { cloudinary } from "@/lib/cloudinary";
import { getEnv } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ user: null }, { status: 401 });
  await dbConnect();
  const doc = await User.findOne({ email: session.user.email }).lean();
  if (!doc) return NextResponse.json({ user: null }, { status: 404 });
  return NextResponse.json({
    user: {
      id: String(doc._id),
      name: doc.name,
      email: doc.email,
      role: doc.role,
      avatarUrl: (doc as any).avatarUrl || "",
    },
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const name = typeof body?.name === "string" ? body.name.trim() : undefined;
    const avatarData = typeof body?.avatarData === "string" ? body.avatarData : undefined;

    await dbConnect();
    const doc = await User.findOne({ email: session.user.email });
    if (!doc) return NextResponse.json({ error: "User not found" }, { status: 404 });

    let avatarUrl = doc.get("avatarUrl") as string | undefined;
    if (avatarData && avatarData.startsWith("data:")) {
      const upload = await cloudinary.uploader.upload(avatarData, {
        folder: getEnv("CLOUDINARY_FOLDER") ? `${getEnv("CLOUDINARY_FOLDER")}/avatars` : "ninekiwi/avatars",
        resource_type: "image",
        overwrite: true,
      });
      avatarUrl = upload.secure_url;
      (doc as any).avatarUrl = avatarUrl;
    }
    if (name) doc.name = name;
    await doc.save();

    return NextResponse.json({
      user: {
        id: String(doc._id),
        name: doc.name,
        email: doc.email,
        role: doc.role,
        avatarUrl: avatarUrl || "",
      },
    });
  } catch (e: any) {
    console.error("Account update error", e);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
