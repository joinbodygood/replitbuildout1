import { NextRequest, NextResponse } from "next/server";
import { dittofeed } from "@/lib/dittofeed";
import { fireWebhook } from "@/lib/webhooks";

/**
 * Webhook endpoint for intake form submissions.
 *
 * Called by the external intake system (glow.bodygoodstudio.com) or
 * by n8n when intake is completed. Fires intake_submitted to Dittofeed
 * so the onboarding journey can progress.
 *
 * POST /api/webhooks/intake
 * Body: { email, patient_id?, program_type?, product_name?, has_allergies?, bmi? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, patient_id, program_type, product_name, has_allergies, bmi } = body;

    if (!email) {
      return NextResponse.json({ error: "email required" }, { status: 400 });
    }

    const userId = patient_id || email;

    dittofeed.identify({
      userId,
      traits: {
        email,
        programInterest: program_type,
      },
    });

    dittofeed.track({
      userId,
      event: "intake_submitted",
      properties: {
        email,
        patient_id,
        program_type,
        product_name,
        has_allergies,
        bmi,
      },
    });

    await fireWebhook("quiz.completed", {
      email,
      patient_id,
      program_type,
      intake_completed: true,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Intake webhook error:", error);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
