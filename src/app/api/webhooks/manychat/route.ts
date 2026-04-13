import { NextRequest, NextResponse } from "next/server";
import { dittofeed } from "@/lib/dittofeed";

/**
 * Webhook for ManyChat lead capture.
 * Called by n8n workflow: manychat-lead-capture.
 *
 * Flow: Instagram/Facebook post → patient comments keyword →
 * ManyChat DM automation → collects email/phone/interest →
 * ManyChat webhook → n8n → this endpoint → Dittofeed.
 *
 * POST /api/webhooks/manychat
 * Body: {
 *   email, first_name?, phone?, keyword?, interest?,
 *   lead_magnet?, source_platform? ("instagram" | "facebook")
 * }
 */

const INTEREST_MAP: Record<string, string> = {
  COST: "glp1",
  PRICING: "glp1",
  PRICE: "glp1",
  INSURANCE: "insurance",
  COVERED: "insurance",
  HAIR: "hair",
  HAIRLOSS: "hair",
  HORMONES: "hormones",
  MENOPAUSE: "hormones",
  PERIMENOPAUSE: "hormones",
  SUPPLEMENTS: "supplements",
  VITAMINS: "supplements",
  INJECTIONS: "wellness_injections",
  B12: "wellness_injections",
  NAD: "wellness_injections",
  GUIDE: "general",
  INFO: "general",
  HELP: "general",
  START: "general",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, first_name, phone, keyword, lead_magnet, source_platform } = body;

    if (!email) {
      return NextResponse.json({ error: "email required" }, { status: 400 });
    }

    const interest =
      body.interest || INTEREST_MAP[(keyword || "").toUpperCase()] || "general";

    dittofeed.identify({
      userId: email,
      traits: {
        email,
        firstName: first_name,
        phone,
        leadSource: "manychat",
        programInterest: interest,
      },
    });

    dittofeed.track({
      userId: email,
      event: "manychat_lead_captured",
      properties: {
        email,
        first_name,
        phone,
        interest,
        lead_magnet,
        keyword,
        source_platform: source_platform || "instagram",
      },
    });

    return NextResponse.json({ ok: true, interest });
  } catch (error) {
    console.error("ManyChat webhook error:", error);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
