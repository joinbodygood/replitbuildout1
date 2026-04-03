import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminUser } from "@/lib/admin-auth";
import { routeSupplementsToShopify } from "@/lib/shopify";

export async function POST(req: NextRequest) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orderId } = await req.json();
  if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 });

  const order = await db.order.findUnique({
    where:   { id: orderId },
    include: { items: true },
  });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const supplementItems = order.items.filter((i) => i.productType === "supplement");
  if (supplementItems.length === 0) {
    return NextResponse.json({ error: "No supplement items in this order" }, { status: 400 });
  }

  const existingFailed = await db.shopifyOrder.findFirst({
    where:   { orderId, status: "failed" },
    orderBy: { createdAt: "desc" },
  });

  if (existingFailed) {
    const maxRetries = 5;
    if (existingFailed.retryCount >= maxRetries) {
      return NextResponse.json(
        { error: `Max retry limit (${maxRetries}) reached for this order` },
        { status: 429 }
      );
    }
    await db.shopifyOrder.update({
      where: { id: existingFailed.id },
      data:  { retryCount: { increment: 1 } },
    });

    await db.shopifyOrder.delete({ where: { id: existingFailed.id } });
  }

  await routeSupplementsToShopify({
    id:              order.id,
    email:           order.email,
    shippingName:    order.shippingName,
    shippingAddress: order.shippingAddress,
    shippingCity:    order.shippingCity,
    shippingState:   order.shippingState,
    shippingZip:     order.shippingZip,
    items:           order.items,
  });

  const updated = await db.shopifyOrder.findFirst({
    where:   { orderId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, shopifyOrder: updated });
}
