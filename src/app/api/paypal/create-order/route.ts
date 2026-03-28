import { NextRequest, NextResponse } from "next/server";
import { createPayPalOrder } from "@/lib/paypal";
import { db } from "@/lib/db";


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subtotal, discountCode } = body;

    if (!subtotal || typeof subtotal !== "number" || subtotal <= 0) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    let discountAmount = 0;

    if (discountCode) {
      const discount = await db.discountCode.findFirst({
        where: {
          code: discountCode,
          isActive: true,
          AND: [
            { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
            { OR: [{ maxUses: null }, { maxUses: { gt: db.discountCode.fields.usedCount } }] },
          ],
        },
      });

      if (discount) {
        if (discount.type === "percentage") {
          discountAmount = Math.round(subtotal * (discount.value / 100));
        } else {
          discountAmount = discount.value;
        }
        if (discount.minOrderValue && subtotal < discount.minOrderValue) {
          discountAmount = 0;
        }
      }
    }

    const finalTotal = Math.max(100, subtotal - discountAmount);

    const order = await createPayPalOrder(
      finalTotal,
      "Body Good Studio - Weight Loss Program"
    );

    return NextResponse.json({
      paypalOrderId: order.id,
      finalTotal,
      discountAmount,
    });
  } catch (error) {
    console.error("PayPal create order error:", error);
    return NextResponse.json({ error: "Failed to create PayPal order" }, { status: 500 });
  }
}
