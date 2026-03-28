import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { fireWebhook } from "@/lib/webhooks";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const order = await db.order.create({
      data: {
        email: body.email,
        phone: body.phone || null,
        status: "pending_intake",
        subtotal: body.subtotal,
        discount: body.discount || 0,
        total: body.total,
        discountCode: body.discountCode || null,
        paypalOrderId: body.paypalOrderId || null,
        shippingName: body.shippingName || null,
        shippingAddress: body.shippingAddress || null,
        shippingCity: body.shippingCity || null,
        shippingState: body.shippingState || null,
        shippingZip: body.shippingZip || null,
        locale: body.locale || "en",
        items: {
          create: body.items.map((item: any) => ({
            productName: item.name,
            variantLabel: item.variantLabel,
            sku: item.sku || null,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    });

    await fireWebhook("order.created", {
      orderId: order.id,
      email: body.email,
      total: body.total,
      items: body.items,
      locale: body.locale,
    });

    // Increment discount code usage if used
    if (body.discountCode) {
      await db.discountCode.updateMany({
        where: { code: body.discountCode },
        data: { usedCount: { increment: 1 } },
      });
    }

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
