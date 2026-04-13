import { NextRequest, NextResponse } from "next/server";
import { dittofeed } from "@/lib/dittofeed";

/**
 * Webhook for refill cycle events.
 * Called by daily cron (refill_reminder) or patient check-in form.
 *
 * POST /api/webhooks/refill
 * Body: {
 *   event: "refill_reminder" | "refill_checkin_completed",
 *   patient_id, email, medication?, dose?, next_billing_date?,
 *   checkin_link?, manage_link?, dose_change_requested?,
 *   side_effects?, satisfaction_score?
 * }
 */

const VALID_EVENTS = new Set([
  "refill_reminder",
  "refill_checkin_completed",
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
        next_billing_date: body.next_billing_date,
        checkin_link: body.checkin_link,
        manage_link: body.manage_link,
        dose_change_requested: body.dose_change_requested,
        side_effects: body.side_effects,
        satisfaction_score: body.satisfaction_score,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Refill webhook error:", error);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
