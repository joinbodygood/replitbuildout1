import { NextRequest, NextResponse } from "next/server";
import { dittofeed } from "@/lib/dittofeed";

/**
 * Webhook for subscription/payment events.
 * Called by PayPal webhook handler or n8n subscription workflows.
 *
 * POST /api/webhooks/subscription
 * Body: {
 *   event: "payment_processed" | "payment_failed" | "subscription_paused" |
 *          "subscription_cancel_initiated" | "subscription_cancelled" |
 *          "dose_change_approved" | "commitment_expiring",
 *   patient_id, email, amount?, medication?, failure_reason?,
 *   retry_date?, pause_reason?, cancellation_reason?, months_active?,
 *   current_program?, total_ltv?, old_dose?, new_dose?, attempt_number?
 * }
 */

const VALID_EVENTS = new Set([
  "payment_processed",
  "payment_failed",
  "subscription_paused",
  "subscription_cancel_initiated",
  "subscription_cancelled",
  "dose_change_approved",
  "commitment_expiring",
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
        amount: body.amount,
        medication: body.medication,
        next_billing_date: body.next_billing_date,
        order_id: body.order_id,
        failure_reason: body.failure_reason,
        retry_date: body.retry_date,
        update_link: body.update_link,
        attempt_number: body.attempt_number,
        pause_reason: body.pause_reason,
        reactivation_link: body.reactivation_link,
        cancellation_reason: body.cancellation_reason,
        current_program: body.current_program,
        months_active: body.months_active,
        total_ltv: body.total_ltv,
        old_dose: body.old_dose,
        new_dose: body.new_dose,
        price_change: body.price_change,
        effective_date: body.effective_date,
        expiry_date: body.expiry_date,
        renewal_options: body.renewal_options,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Subscription webhook error:", error);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
