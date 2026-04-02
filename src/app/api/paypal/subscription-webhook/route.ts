import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { fireWebhook } from "@/lib/webhooks";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const eventId: string = payload.id ?? `unknown-${Date.now()}`;
    const eventType: string = payload.event_type ?? "UNKNOWN";
    const resource = payload.resource ?? {};

    const subscriptionId: string | null =
      resource.id ?? resource.billing_agreement_id ?? null;

    if (payload.id) {
      const existing = await db.paypalWebhookEvent.findUnique({
        where: { eventId: payload.id },
      });
      if (existing) return NextResponse.json({ received: true });
    }

    await db.paypalWebhookEvent.create({
      data: {
        eventId,
        eventType,
        resourceId: subscriptionId,
        payload: JSON.stringify(payload),
      },
    });

    if (subscriptionId) {
      const order = await db.order.findFirst({
        where: { paypalSubscriptionId: subscriptionId },
      });

      if (order) {
        if (
          eventType === "BILLING.SUBSCRIPTION.CANCELLED" ||
          eventType === "BILLING.SUBSCRIPTION.EXPIRED"
        ) {
          await db.order.update({
            where: { id: order.id },
            data: { status: "cancelled" },
          });
          await fireWebhook("subscription.cancelled", {
            orderId: order.id,
            email: order.email,
            subscriptionId,
            eventType,
          });
        } else if (eventType === "BILLING.SUBSCRIPTION.SUSPENDED") {
          await db.order.update({
            where: { id: order.id },
            data: { status: "processing" },
          });
        } else if (
          eventType === "PAYMENT.SALE.COMPLETED" ||
          eventType === "BILLING.SUBSCRIPTION.PAYMENT.FAILED"
        ) {
          const amount =
            resource?.amount?.total ??
            resource?.amount?.value ??
            null;
          await fireWebhook("subscription.payment", {
            orderId: order.id,
            email: order.email,
            subscriptionId,
            eventType,
            amount,
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Subscription webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
