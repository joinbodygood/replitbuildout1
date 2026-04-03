import { NextRequest, NextResponse } from "next/server";
import { getPayPalSubscription } from "@/lib/paypal-subscriptions";
import { db } from "@/lib/db";
import { fireWebhook } from "@/lib/webhooks";
import { upsertContact, openConversation } from "@/lib/chatwoot";
import { routeSupplementsToShopify } from "@/lib/shopify";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      subscriptionId,
      email,
      phone,
      monthlyPriceCents,
      displayTotalCycles,
      setupFeeCents,
      referralCode,
      shippingName,
      shippingAddress,
      shippingCity,
      shippingState,
      shippingZip,
      locale,
      items,
    } = body;

    if (!subscriptionId || !email || !items) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const sub = await getPayPalSubscription(subscriptionId);
    if (!["APPROVAL_PENDING", "APPROVED", "ACTIVE"].includes(sub.status)) {
      return NextResponse.json(
        { error: `Subscription not approved. Status: ${sub.status}` },
        { status: 402 }
      );
    }

    const firstMonthTotal = (monthlyPriceCents ?? 0) + (setupFeeCents ?? 0);

    const order = await db.order.create({
      data: {
        email,
        phone: phone || null,
        status: "pending_intake",
        subtotal: firstMonthTotal,
        discount: 0,
        total: firstMonthTotal,
        paypalSubscriptionId: subscriptionId,
        shippingName: shippingName || null,
        shippingAddress: shippingAddress || null,
        shippingCity: shippingCity || null,
        shippingState: shippingState || null,
        shippingZip: shippingZip || null,
        locale: locale || "en",
        items: {
          create: (items as { name: string; variantLabel: string; sku?: string; price: number; quantity: number; productType?: string }[]).map(
            (item) => ({
              productName: item.name,
              variantLabel: item.variantLabel,
              sku: item.sku || null,
              price: item.price,
              quantity: item.quantity,
              productType: item.productType ?? "rx",
            })
          ),
        },
      },
      include: { items: true },
    });

    // Route supplement items to Shopify for Supliful fulfillment (fire-and-forget)
    void routeSupplementsToShopify({
      id:              order.id,
      email:           order.email,
      shippingName:    order.shippingName,
      shippingAddress: order.shippingAddress,
      shippingCity:    order.shippingCity,
      shippingState:   order.shippingState,
      shippingZip:     order.shippingZip,
      items:           order.items,
    });

    if (referralCode) {
      const cleanCode = (referralCode as string).trim().toUpperCase();
      const referral = await db.referral.findFirst({
        where: { referrerCode: cleanCode, status: "pending", referredEmail: null },
      });

      if (referral) {
        await db.referral.update({
          where: { id: referral.id },
          data: {
            referredEmail: email,
            referredOrderId: order.id,
            status: "completed",
            referrerCredited: true,
          },
        });

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
      total: firstMonthTotal,
      paypalSubscriptionId: subscriptionId,
      subscriptionMonthlyPrice: monthlyPriceCents,
      subscriptionCycles: displayTotalCycles,
      items,
      locale,
    });

    void (async () => {
      const isEs = (locale as string) === "es";
      const firstName = (shippingName as string | null)?.split(" ")[0] ?? null;
      const productList = (items as { name: string }[]).map((i) => i.name).join(", ");

      const contactId = await upsertContact({
        email,
        name: shippingName || undefined,
        phone: phone || undefined,
        attributes: {
          order_id: order.id,
          preferred_language: locale || "en",
          source: "subscription",
        },
      });

      if (contactId) {
        const name = firstName || (isEs ? "paciente" : "there");
        const msg = isEs
          ? `¡Bienvenida a Body Good Studio, ${name}! Tu suscripción ha sido activada (${productList}). La Dra. Moleon y nuestro equipo se comunicarán contigo en las próximas 24 horas para iniciar tu proceso de admisión.`
          : `Welcome to Body Good Studio, ${name}! Your subscription has been activated (${productList}). Dr. Moleon and our team will reach out within 24 hours to complete your patient intake. We're so excited to start this journey with you!`;
        await openConversation({ contactId, message: msg, label: "new-patient" });
      }
    })();

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error("Subscription approved error:", error);
    return NextResponse.json({ error: "Failed to process subscription" }, { status: 500 });
  }
}
