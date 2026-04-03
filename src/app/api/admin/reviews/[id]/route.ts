import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminUser } from "@/lib/admin-auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const allowed = ["isApproved", "isFeatured", "productSlug", "title", "body"];
  const data: any = {};
  for (const key of allowed) {
    if (key in body) data[key] = body[key];
  }

  const review = await db.review.update({
    where: { id: params.id },
    data,
  });
  return NextResponse.json({ review });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db.review.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
