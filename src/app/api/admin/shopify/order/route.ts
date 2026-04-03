import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminUser } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");
  if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 });

  const shopifyOrder = await db.shopifyOrder.findFirst({
    where:   { orderId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ shopifyOrder: shopifyOrder ?? null });
}
