import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cancelPayPalSubscription } from "@/lib/paypal-subscriptions";

type Props = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const reason: string = body.reason ?? "Cancelled by administrator";

    const order = await db.order.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (!order.paypalSubscriptionId) {
      return NextResponse.json({ error: "Not a subscription order" }, { status: 400 });
    }

    await cancelPayPalSubscription(order.paypalSubscriptionId, reason);

    await db.order.update({
      where: { id },
      data: { status: "cancelled" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 });
  }
}
