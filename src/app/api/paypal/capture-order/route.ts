import { NextRequest, NextResponse } from "next/server";
import { capturePayPalOrder, getPayPalOrder } from "@/lib/paypal";
import { db } from "@/lib/db";
import { fireWebhook } from "@/lib/webhooks";
import { upsertContact, openConversation } from "@/lib/chatwoot";

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
      referralCode,
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

    // ── Referral reward: credit the referrer with a $25 discount code ─────────
    if (referralCode) {
      const cleanCode = (referralCode as string).trim().toUpperCase();
      const referral = await db.referral.findFirst({
        where: { referrerCode: cleanCode, status: "pending", referredEmail: null },
      });

      if (referral) {
        // Mark the referral as completed
        await db.referral.update({
          where: { id: referral.id },
          data: {
            referredEmail: email,
            referredOrderId: order.id,
            status: "completed",
            referrerCredited: true,
          },
        });

        // Create a unique $25 credit code for the referrer
        const creditCode =
          "BGS25-" +
          Math.random().toString(36).slice(2, 6).toUpperCase() +
          Math.random().toString(36).slice(2, 6).toUpperCase();

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 90);

        await db.discountCode.create({
          data: {
            code: creditCode,
            type: "fixed",
            value: 2500,
            maxUses: 1,
            usedCount: 0,
            isActive: true,
            expiresAt,
          },
        });

        // Notify referrer via webhook (triggers email send)
        void fireWebhook("referral.credited", {
          referrerEmail: referral.referrerEmail,
          referredEmail: email,
          creditCode,
          creditAmount: 25,
          orderId: order.id,
          expiresAt: expiresAt.toISOString(),
        });
      }
    }

    await fireWebhook("order.created", {
      orderId: order.id,
      email,
      total: finalTotal,
      paypalOrderId,
      items,
      locale,
    });

    // ── Chatwoot: upsert patient contact + send personalised welcome ─────────
    void (async () => {
      const isEs        = (locale as string) === "es";
      const firstName   = (shippingName as string | null)?.split(" ")[0] ?? null;
      const productList = (items as { name: string }[]).map((i) => i.name).join(", ");

      const contactId = await upsertContact({
        email,
        name:  shippingName || undefined,
        phone: phone || undefined,
        attributes: {
          order_id:           order.id,
          preferred_language: locale || "en",
          source:             "purchase",
        },
      });

      if (contactId) {
        const name = firstName || (isEs ? "paciente" : "there");
        const msg = isEs
          ? `¡Bienvenida a Body Good Studio, ${name}! Tu pedido ha sido recibido (${productList}). La Dra. Moleon y nuestro equipo se comunicarán contigo en las próximas 24 horas para iniciar tu proceso de admisión. ¡Estamos emocionadas de comenzar este camino contigo!`
          : `Welcome to Body Good Studio, ${name}! Your order has been received (${productList}). Dr. Moleon and our team will reach out within 24 hours to complete your patient intake. We're so excited to start this journey with you!`;

        await openConversation({
          contactId,
          message: msg,
          label: "new-patient",
        });
      }
    })();

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error("PayPal capture error:", error);
    return NextResponse.json({ error: "Failed to capture payment" }, { status: 500 });
  }
}
