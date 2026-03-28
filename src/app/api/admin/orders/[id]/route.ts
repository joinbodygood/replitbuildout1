import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { db as prisma } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ order });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const allowedFields = ["status", "notes", "shippingName", "shippingAddress", "shippingCity", "shippingState", "shippingZip"];
  const data: Record<string, string> = {};
  for (const f of allowedFields) {
    if (body[f] !== undefined) data[f] = body[f];
  }

  const order = await prisma.order.update({ where: { id }, data, include: { items: true } });
  return NextResponse.json({ order });
}
