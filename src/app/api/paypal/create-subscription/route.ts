import { NextRequest, NextResponse } from "next/server";
import { getOrCreatePayPalPlan } from "@/lib/paypal-subscriptions";
import { buildSubscriptionDescription, classifyCart } from "@/lib/subscription-utils";
import type { CartItem } from "@/context/CartContext";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { monthlyPriceCents, paypalTotalCycles, setupFeeCents, description } = body;

    if (typeof monthlyPriceCents !== "number" || monthlyPriceCents <= 0) {
      return NextResponse.json({ error: "Invalid plan parameters" }, { status: 400 });
    }

    const planDescription =
      description ??
      buildSubscriptionDescription(
        classifyCart([
          {
            productId: "sub",
            variantId: "sub",
            name: "Subscription",
            variantLabel: "",
            price: monthlyPriceCents,
            quantity: 1,
            slug: "",
            isMedPlan: true,
            monthlyPrice: monthlyPriceCents,
            durationMonths: paypalTotalCycles === 0 ? 1 : paypalTotalCycles,
          } as CartItem,
        ])
      );

    const planId = await getOrCreatePayPalPlan({
      pricePerCycleCents: monthlyPriceCents,
      totalCycles: paypalTotalCycles ?? 0,
      setupFeeCents: setupFeeCents ?? 0,
      description: planDescription,
    });

    return NextResponse.json({ planId });
  } catch (error) {
    console.error("Create subscription plan error:", error);
    return NextResponse.json({ error: "Failed to create subscription plan" }, { status: 500 });
  }
}
