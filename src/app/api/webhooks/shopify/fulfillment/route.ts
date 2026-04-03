import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyShopifyWebhook } from "@/lib/shopify";

export async function POST(req: NextRequest) {
  const hmacHeader = req.headers.get("x-shopify-hmac-sha256") ?? "";
  const rawBody    = await req.text();

  if (!verifyShopifyWebhook(rawBody, hmacHeader)) {
    console.warn("[Shopify Webhook] Invalid HMAC signature");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const shopifyOrderId = String((payload.id as number | string) ?? "");
  const note           = (payload.note as string) ?? "";
  const fulfillments   = (payload.fulfillments as Array<Record<string, unknown>>) ?? [];

  // Extract our order ID from the note (e.g. "Auto-created from Body Good platform. Order #abc123")
  const match = note.match(/Order #([a-zA-Z0-9]+)/);
  const ourOrderId = match?.[1] ?? null;

  if (!shopifyOrderId) {
    return NextResponse.json({ error: "Missing shopify order id" }, { status: 400 });
  }

  const firstFulfillment = fulfillments[0];
  const trackingNumber   = (firstFulfillment?.tracking_number as string) ?? null;
  const trackingCompany  = (firstFulfillment?.tracking_company as string) ?? null;
  const fulfillmentStatus = ((payload.fulfillment_status as string) ?? "shipped").toLowerCase();

  const mappedStatus =
    fulfillmentStatus === "fulfilled" ? "shipped" :
    fulfillmentStatus === "partial"   ? "processing" :
    "shipped";

  const shippedAt = firstFulfillment ? new Date() : null;

  const shopifyOrder = await db.shopifyOrder.findUnique({ where: { shopifyOrderId } });

  if (shopifyOrder) {
    await db.shopifyOrder.update({
      where: { shopifyOrderId },
      data: {
        status:         mappedStatus,
        trackingNumber: trackingNumber ?? shopifyOrder.trackingNumber,
        trackingCarrier: trackingCompany ?? shopifyOrder.trackingCarrier,
        shippedAt:      shippedAt ?? shopifyOrder.shippedAt,
      },
    });

    await db.orderItem.updateMany({
      where: { orderId: shopifyOrder.orderId, productType: "supplement" },
      data:  {
        shopifyFulfillmentStatus: mappedStatus,
        trackingNumber:           trackingNumber ?? undefined,
        trackingCarrier:          trackingCompany ?? undefined,
      },
    });

    if (mappedStatus === "shipped") {
      const allItems = await db.orderItem.findMany({ where: { orderId: shopifyOrder.orderId } });
      const allShipped = allItems.every(
        (i) => i.productType !== "supplement" || i.shopifyFulfillmentStatus === "shipped"
      );
      if (allShipped) {
        await db.order.update({
          where: { id: shopifyOrder.orderId },
          data:  { status: "shipped" },
        });
      }
    }

    console.log(`[Shopify Webhook] Order ${shopifyOrderId} → ${mappedStatus}, tracking: ${trackingNumber}`);
  } else if (ourOrderId) {
    console.warn(`[Shopify Webhook] ShopifyOrder record not found for ${shopifyOrderId}, ourOrderId=${ourOrderId}`);
  } else {
    console.warn(`[Shopify Webhook] Unrecognized order ${shopifyOrderId} — no note match`);
  }

  return NextResponse.json({ received: true });
}
