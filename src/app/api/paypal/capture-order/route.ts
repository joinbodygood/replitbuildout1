import { NextRequest, NextResponse } from "next/server";
import { capturePayPalOrder, getPayPalOrder } from "@/lib/paypal";
import { db } from "@/lib/db";
import { fireWebhook } from "@/lib/webhooks";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      paypalOrderId,
      email,
      phone,
      subtotal,
      discountAmount,
      finalTotal,
      discountCode,
      shippingName,
      shippingAddress,
      shippingCity,
      shippingState,
      shippingZip,
      locale,
      items,
    } = body;

    if (!paypalOrderId || !email || !items) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const captureResult = await capturePayPalOrder(paypalOrderId);

    if (captureResult.status !== "COMPLETED") {
      return NextResponse.json(
        { error: `Payment not completed. Status: ${captureResult.status}` },
        { status: 402 }
      );
    }

    const capturedAmount = parseFloat(
      captureResult.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value ?? "0"
    );
    const expectedAmount = finalTotal / 100;

    if (Math.abs(capturedAmount - expectedAmount) > 0.01) {
      console.error(`Amount mismatch: captured ${capturedAmount}, expected ${expectedAmount}`);
      return NextResponse.json({ error: "Payment amount mismatch" }, { status: 402 });
    }

    const order = await db.order.create({
      data: {
        email,
        phone: phone || null,
        status: "pending_intake",
        subtotal,
        discount: discountAmount || 0,
        total: finalTotal,
        discountCode: discountCode || null,
        paypalOrderId,
        shippingName: shippingName || null,
        shippingAddress: shippingAddress || null,
        shippingCity: shippingCity || null,
        shippingState: shippingState || null,
        shippingZip: shippingZip || null,
        locale: locale || "en",
        items: {
          create: items.map((item: { name: string; variantLabel: string; sku?: string; price: number; quantity: number }) => ({
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

    if (discountCode) {
      await db.discountCode.updateMany({
        where: { code: discountCode },
        data: { usedCount: { increment: 1 } },
      });
    }

    await fireWebhook("order.created", {
      orderId: order.id,
      email,
      total: finalTotal,
      paypalOrderId,
      items,
      locale,
    });

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error("PayPal capture error:", error);
    return NextResponse.json({ error: "Failed to capture payment" }, { status: 500 });
  }
}
