import { NextRequest, NextResponse } from "next/server";
import { getCaseByStatusToken } from "@/lib/pa/case-service";
import { STAGE_FRIENDLY, DRUG_DISPLAY } from "@/lib/pa/constants";
import type { PublicCaseStatus } from "@/lib/pa/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const caseData = await getCaseByStatusToken(token);

  if (!caseData) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  const medications = caseData.submissions.map((s) => ({
    drug: DRUG_DISPLAY[s.drug] ?? s.drug,
    status: s.status,
  }));

  const result: PublicCaseStatus = {
    stage: caseData.stage,
    stageFriendly: STAGE_FRIENDLY[caseData.stage] ?? "Status unknown. Please contact us.",
    medications,
    nextStep: getNextStep(caseData.stage),
  };

  return NextResponse.json(result);
}

function getNextStep(stage: string): string {
  switch (stage) {
    case "eligibility_review":
      return "Our team is reviewing your coverage. No action needed from you.";
    case "pending_pa_purchase":
      return "Purchase the PA processing service to continue.";
    case "pa_processing":
      return "We're actively working with your insurer. We'll update you on any progress.";
    case "pending_activation":
      return "Complete your activation payment to start receiving medication.";
    case "active_management":
      return "Your next refill will be processed automatically.";
    default:
      return "Contact us at support@joinbodygood.com for more information.";
  }
}
