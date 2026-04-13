import { NextRequest, NextResponse } from "next/server";
import { dittofeed } from "@/lib/dittofeed";

/**
 * Webhook for Carly wellness coach events.
 * Called by n8n workflows: carly-checkin-complete, carly-flag.
 *
 * POST /api/webhooks/carly
 * Body: {
 *   event: "carly_checkin_completed" | "carly_flag_hair_concern" |
 *          "carly_flag_energy" | "carly_flag_mood" | "carly_clinical_alert",
 *   patient_id, email, mood?, wins?, challenges?, weight_reported?,
 *   engagement_score?, context?, alert_type?, severity?
 * }
 */

const VALID_EVENTS = new Set([
  "carly_checkin_completed",
  "carly_flag_hair_concern",
  "carly_flag_energy",
  "carly_flag_mood",
  "carly_clinical_alert",
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
        mood: body.mood,
        wins: body.wins,
        challenges: body.challenges,
        weight_reported: body.weight_reported,
        engagement_score: body.engagement_score,
        context: body.context,
        alert_type: body.alert_type,
        severity: body.severity,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Carly webhook error:", error);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
