import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { clerkId: string } }
) {
  const { clerkId } = await  params;
  const user = await prisma.user.findUnique({ where: { clerkId } });
  return NextResponse.json(user);
}
