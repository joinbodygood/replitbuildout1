import { NextRequest, NextResponse } from "next/server";
import { dittofeed } from "@/lib/dittofeed";
import { shouldSend } from "@/lib/suppression";

/**
 * Lightweight proxy for client-side Dittofeed events.
 *
 * The client can't call Dittofeed directly (write key is a secret), so it
 * posts here with { event, userId, properties }. This route validates,
 * checks suppression, and forwards to Dittofeed.
 *
 * Used for: checkout_started, checkout_abandoned (via journey wait-node),
 * product_page_viewed, and any other browser-originating events.
 */

const ALLOWED_EVENTS = new Set([
  "checkout_started",
  "product_page_viewed",
]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, userId, properties } = body;

    if (!event || !userId) {
      return NextResponse.json({ error: "event and userId required" }, { status: 400 });
    }

    if (!ALLOWED_EVENTS.has(event)) {
      return NextResponse.json({ error: "event not allowed" }, { status: 403 });
    }

    // Suppression check
    const decision = await shouldSend(userId, event);
    if (!decision.allow) {
      return NextResponse.json({ ok: true, suppressed: true, reason: decision.reason });
    }

    // Identify if we have traits
    if (properties?.email) {
      dittofeed.identify({
        userId,
        traits: {
          email: properties.email,
          firstName: properties.first_name,
          phone: properties.phone,
        },
      });
    }

    dittofeed.track({
      userId,
      event,
      properties: properties ?? {},
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Dittofeed proxy error:", error);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
