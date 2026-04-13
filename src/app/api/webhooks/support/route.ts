import { NextRequest, NextResponse } from "next/server";
import { dittofeed } from "@/lib/dittofeed";

/**
 * Webhook for Claudia (support) and Kelly (sales) agent events.
 * Called by n8n workflows: claudia-ticket-resolved, kelly-converted,
 * kelly-exhausted.
 *
 * POST /api/webhooks/support
 * Body: {
 *   event: "support_ticket_resolved" | "kelly_lead_converted" |
 *          "kelly_sequence_exhausted",
 *   patient_id | lead_id, email, resolution_type?, category?, agent?,
 *   product_purchased?, promo_used?, channel?, stages_completed?,
 *   last_objection?
 * }
 */

const VALID_EVENTS = new Set([
  "support_ticket_resolved",
  "kelly_lead_converted",
  "kelly_sequence_exhausted",
]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, email } = body;

    if (!event || !email) {
      return NextResponse.json({ error: "event and email required" }, { status: 400 });
    }

    if (!VALID_EVENTS.has(event)) {
      return NextResponse.json({ error: `unknown event: ${event}` }, { status: 400 });
    }

    const userId = body.patient_id || body.lead_id || email;

    dittofeed.identify({
      userId,
      traits: { email },
    });

    dittofeed.track({
      userId,
      event,
      properties: {
        patient_id: body.patient_id,
        lead_id: body.lead_id,
        email,
        resolution_type: body.resolution_type,
        category: body.category,
        agent: body.agent,
        product_purchased: body.product_purchased,
        promo_used: body.promo_used,
        channel: body.channel,
        stages_completed: body.stages_completed,
        last_objection: body.last_objection,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Support webhook error:", error);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
