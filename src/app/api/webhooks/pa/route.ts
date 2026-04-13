import { NextRequest, NextResponse } from "next/server";
import { dittofeed } from "@/lib/dittofeed";

/**
 * Webhook for PA Engine / insurance eligibility events.
 * Called by n8n workflows: pa-engine-start, pa-engine-result,
 * pa-engine-submitted, pa-engine-status, pa-engine-renewal.
 *
 * POST /api/webhooks/pa
 * Body: {
 *   event: "eligibility_check_started" | "eligibility_result_ready" |
 *          "pa_submitted" | "pa_status_changed" | "pa_renewal_filed",
 *   patient_id, email, insurance_carrier?, plan_type?, result?,
 *   coverage_details?, probability_score?, pa_reference?,
 *   medication_requested?, pa_status?, decision_date?, next_steps?,
 *   pa_expiry_date?, renewal_date?
 * }
 */

const VALID_EVENTS = new Set([
  "eligibility_check_started",
  "eligibility_result_ready",
  "pa_submitted",
  "pa_status_changed",
  "pa_renewal_filed",
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
        insurance_carrier: body.insurance_carrier,
        plan_type: body.plan_type,
        result: body.result,
        coverage_details: body.coverage_details,
        probability_score: body.probability_score,
        pa_reference: body.pa_reference,
        medication_requested: body.medication_requested,
        pa_status: body.pa_status,
        decision_date: body.decision_date,
        next_steps: body.next_steps,
        pa_expiry_date: body.pa_expiry_date,
        renewal_date: body.renewal_date,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("PA webhook error:", error);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
