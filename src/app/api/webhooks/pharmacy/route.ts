import { NextRequest, NextResponse } from "next/server";
import { dittofeed } from "@/lib/dittofeed";

/**
 * Webhook for Roxy pharmacy operations events.
 * Called by n8n workflows: roxy-rx-submitted, roxy-order-shipped,
 * roxy-order-delivered, roxy-rx-filled, roxy-pickup-ready.
 *
 * POST /api/webhooks/pharmacy
 * Body: {
 *   event: "rx_pended" | "rx_submitted" | "rx_fill_confirmed" |
 *          "order_shipped" | "order_delivered" | "rx_pharmacy_pickup_ready",
 *   patient_id, email, medication?, dose?, pharmacy_name?,
 *   tracking_number?, carrier?, estimated_delivery?,
 *   is_compounded?, pharmacy_address?, pharmacy_phone?
 * }
 */

const VALID_EVENTS = new Set([
  "rx_pended",
  "rx_submitted",
  "rx_fill_confirmed",
  "order_shipped",
  "order_delivered",
  "rx_pharmacy_pickup_ready",
]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, patient_id, email } = body;

    if (!event || !email) {
      return NextResponse.json({ error: "event and email required" }, { status: 400 });
    }

    if (!VALID_EVENTS.has(event)) {
      return NextResponse.json({ error: `unknown event: ${event}` }, { status: 400 });
    }

    const userId = patient_id || email;

    dittofeed.identify({
      userId,
      traits: { email },
    });

    dittofeed.track({
      userId,
      event,
      properties: {
        patient_id,
        email,
        medication: body.medication,
        dose: body.dose,
        pharmacy_name: body.pharmacy_name,
        pharmacy_address: body.pharmacy_address,
        pharmacy_phone: body.pharmacy_phone,
        tracking_number: body.tracking_number,
        carrier: body.carrier,
        estimated_delivery: body.estimated_delivery,
        estimated_fill_date: body.estimated_fill_date,
        is_compounded: body.is_compounded,
        fill_date: body.fill_date,
        delivery_date: body.delivery_date,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Pharmacy webhook error:", error);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
