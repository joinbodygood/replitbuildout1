import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const orders = await db.order.findMany({
      where: { paypalSubscriptionId: { not: null } },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Subscriptions list error:", error);
    return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 });
  }
}
