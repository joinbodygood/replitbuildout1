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
  return true;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { intake: Partial<IntakeAnswers>; locale?: string };
  if (!isValid(body.intake)) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const intake = body.intake;
  const locale = body.locale ?? "en";

  const result = await calculateCoverage(intake);

  const lead = await upsertLead({
    intake, result,
    ipAddress: req.headers.get("x-forwarded-for") ?? null,
    userAgent: req.headers.get("user-agent") ?? null,
    locale,
  });

  // Fire-and-forget webhooks
  fireLeadWebhooks({ leadId: lead.id, intake, result, locale }).catch(() => { /* silent */ });

  return NextResponse.json({ leadId: lead.id, result });
}
