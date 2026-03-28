import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminUser } from "@/lib/admin-auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const product = await db.product.findUnique({
    where: { id },
    include: {
      translations: true,
      variants: { orderBy: { sortOrder: "asc" } },
      images: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const allowed = [
    "isActive", "isFeatured", "sortOrder", "sku", "programTag",
    "fulfillment", "dosageForm", "forGender", "pathBConsultPrice",
    "pathBOngoingPrice", "fccMedicationName", "fccConcentration",
    "requiresPrescription", "category",
  ] as const;

  const data: Record<string, unknown> = {};
  for (const field of allowed) {
    if (field in body) data[field] = body[field];
  }

  const product = await db.product.update({
    where: { id },
    data,
    include: {
      translations: { where: { locale: "en" } },
      variants: { orderBy: { sortOrder: "asc" } },
      _count: { select: { variants: true } },
    },
  });

  return NextResponse.json({ product });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAdminUser();
  if (!user || user.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await db.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
