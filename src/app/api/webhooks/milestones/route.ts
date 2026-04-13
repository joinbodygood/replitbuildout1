import { NextRequest, NextResponse } from "next/server";
import { dittofeed } from "@/lib/dittofeed";

/**
 * Webhook for lifecycle milestone events.
 * Called by daily crons or inventory management.
 *
 * POST /api/webhooks/milestones
 * Body: {
 *   event: "milestone_month_1" | "milestone_month_2" | "milestone_month_3" |
 *          "milestone_month_6" | "milestone_month_12" | "patient_birthday" |
 *          "product_back_in_stock" | "account_created",
 *   patient_id?, email, first_name?, months_active?, program_type?,
 *   total_spent?, product_name?, product_sku?
 * }
 */

const VALID_EVENTS = new Set([
  "milestone_month_1",
  "milestone_month_2",
  "milestone_month_3",
  "milestone_month_6",
  "milestone_month_12",
  "patient_birthday",
  "product_back_in_stock",
  "account_created",
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

    const userId = body.patient_id || email;

    dittofeed.identify({
      userId,
      traits: {
        email,
        firstName: body.first_name,
      },
    });

    dittofeed.track({
      userId,
      event,
      properties: {
        patient_id: body.patient_id,
        email,
        first_name: body.first_name,
        months_active: body.months_active,
        program_type: body.program_type,
        total_spent: body.total_spent,
        product_name: body.product_name,
        product_sku: body.product_sku,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Milestones webhook error:", error);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
