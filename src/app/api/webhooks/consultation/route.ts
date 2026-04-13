import { NextRequest, NextResponse } from "next/server";
import { dittofeed } from "@/lib/dittofeed";

/**
 * Webhook for Dr. Linda Bot consultation events.
 * Called by n8n workflows: dr-linda-bot-complete, dr-linda-bot-escalate.
 *
 * POST /api/webhooks/consultation
 * Body: {
 *   event: "consultation_complete" | "consultation_escalated",
 *   patient_id, email, risk_level?, program_type?, next_step?,
 *   escalation_reason?, assigned_provider?
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, patient_id, email } = body;

    if (!event || !email) {
      return NextResponse.json({ error: "event and email required" }, { status: 400 });
    }

    const userId = patient_id || email;

    dittofeed.identify({
      userId,
      traits: {
        email,
        programInterest: body.program_type,
      },
    });

    if (event === "consultation_complete") {
      dittofeed.track({
        userId,
        event: "consultation_complete",
        properties: {
          patient_id,
          email,
          risk_level: body.risk_level,
          program_type: body.program_type,
          next_step: body.next_step,
        },
      });
    } else if (event === "consultation_escalated") {
      dittofeed.track({
        userId,
        event: "consultation_escalated",
        properties: {
          patient_id,
          email,
          risk_level: body.risk_level,
          escalation_reason: body.escalation_reason,
          assigned_provider: body.assigned_provider,
        },
      });
    } else {
      return NextResponse.json({ error: `unknown event: ${event}` }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Consultation webhook error:", error);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
