import { NextRequest, NextResponse } from "next/server";
import { calculateCoverage } from "@/lib/insurance/confidence-engine";
import type { IntakeAnswers } from "@/lib/insurance/routing";
import { upsertLead } from "@/lib/leads/insurance-check-lead";
import { fireLeadWebhooks } from "@/lib/leads/webhooks-insurance-check";

function isValid(intake: Partial<IntakeAnswers>): intake is IntakeAnswers {
  if (!intake.insuranceOrigin || !intake.carrier || !intake.state || !intake.zip) return false;
  if (typeof intake.heightInches !== "number" || typeof intake.weightLb !== "number") return false;
  if (!intake.contact?.firstName || !intake.contact?.email) return false;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(intake.contact.email)) return false;
  if (!Array.isArray(intake.diagnoses)) return false;
  if (!intake.utm || typeof intake.utm !== "object") return false;
  return true;
}

export async function POST(req: NextRequest) {
  let body: { intake: Partial<IntakeAnswers>; locale?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isValid(body.intake)) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const intake = body.intake;
  const locale = body.locale ?? "en";

  try {
    const result = await calculateCoverage(intake);

    const lead = await upsertLead({
      intake, result,
      ipAddress: req.headers.get("x-forwarded-for") ?? null,
      userAgent: req.headers.get("user-agent") ?? null,
      locale,
    });

    fireLeadWebhooks({ leadId: lead.id, intake, result, locale }).catch(err => {
      console.error("[insurance-check/submit] webhook fan-out failed", { leadId: lead.id, err });
    });

    return NextResponse.json({ leadId: lead.id, result });
  } catch (err) {
    console.error("[insurance-check/submit] handler failed", { email: intake.contact.email, err });
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
