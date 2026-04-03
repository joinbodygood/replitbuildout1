import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { db as prisma } from "@/lib/db";
import { addNote } from "@/lib/pa/case-service";
import { fireEvent, buildEvent } from "@/lib/pa/webhook-service";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; subId: string }> }
) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, subId } = await params;
  const body = await req.json();

  const updated = await prisma.pASubmission.update({
    where: { id: subId },
    data: {
      status: body.status,
      denialReason: body.denialReason,
      denialRef: body.denialRef,
      denialDate: body.denialDate ? new Date(body.denialDate) : undefined,
      denialText: body.denialText,
      submittedAt: body.status === "submitted" ? new Date() : undefined,
      respondedAt: body.status === "approved" || body.status === "denied" ? new Date() : undefined,
      externalReviewOutcome: body.externalReviewOutcome,
      stateComplaintFiled: body.stateComplaintFiled,
      stateComplaintOutcome: body.stateComplaintOutcome,
    },
  });

  if (body.status === "denied") {
    await addNote(id, user.id, `${updated.drug} denied: ${body.denialReason ?? "unknown"}`, "denial_logged", {
      drug: updated.drug,
      round: updated.round,
      reason: body.denialReason,
      ref: body.denialRef,
    });

    const caseData = await prisma.insuranceCase.findUnique({ where: { id } });
    if (caseData) {
      await fireEvent(
        buildEvent("pa.denial_logged", id, caseData.patientEmail, caseData.patientName, {
          drug: updated.drug,
          round: updated.round,
          reason: body.denialReason,
        })
      );
    }
  }

  if (body.status === "approved") {
    await addNote(id, user.id, `${updated.drug} APPROVED!`, "status_change", {
      drug: updated.drug,
      round: updated.round,
    });

    const caseData = await prisma.insuranceCase.findUnique({ where: { id } });
    if (caseData) {
      await fireEvent(
        buildEvent("pa.approved", id, caseData.patientEmail, caseData.patientName, {
          drug: updated.drug,
          round: updated.round,
        })
      );
    }
  }

  return NextResponse.json(updated);
}
