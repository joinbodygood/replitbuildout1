import { ConfidenceEngine } from "@/lib/insurance/confidence-engine";
import type { PatientInput } from "@/lib/insurance/confidence-engine";
import { runStediCheck } from "@/lib/insurance/stedi";
import { runWebSearch } from "@/lib/insurance/web-search";
import { db as prisma } from "@/lib/db";
import { createCase, findCaseByEmail, addNote } from "./case-service";

export async function runEligibilityCheck(input: {
  patientEmail: string;
  patientName: string;
  patientState: string;
  insurerName: string;
  memberId: string;
  groupNumber?: string;
  subscriberName: string;
  subscriberDob: string;
  conditions: string[];
  employerSize: string;
  planType: string;
  orderId?: string;
}) {
  const nameParts = input.subscriberName.trim().split(/\s+/);
  const firstName = nameParts[0] || "Unknown";
  const lastName = nameParts.slice(1).join(" ") || "Unknown";

  const patient: PatientInput = {
    firstName,
    lastName,
    dob: input.subscriberDob,
    state: input.patientState,
    insurerName: input.insurerName,
    memberId: input.memberId,
    groupNumber: input.groupNumber,
    diagnoses: input.conditions,
    employerSize: input.employerSize,
    planType: input.planType,
  };

  const [stediResult, webSearchResult] = await Promise.all([
    runStediCheck({
      insurerName: input.insurerName,
      memberId: input.memberId,
      groupNumber: input.groupNumber,
      firstName,
      lastName,
      dob: input.subscriberDob,
    }).catch(() => null),
    runWebSearch({
      insurerName: input.insurerName,
      state: input.patientState,
      diagnoses: input.conditions,
      employerSize: input.employerSize,
    }).catch(() => null),
  ]);

  const engine = new ConfidenceEngine();
  const results = await engine.calculateCoverage(patient, stediResult, webSearchResult);

  let insuranceCase = await findCaseByEmail(input.patientEmail);
  if (!insuranceCase) {
    insuranceCase = await createCase({
      patientEmail: input.patientEmail,
      patientName: input.patientName,
      patientState: input.patientState,
      carrierName: input.insurerName,
      memberId: input.memberId,
      groupNumber: input.groupNumber,
      planType: input.planType,
      subscriberName: input.subscriberName,
      subscriberDob: input.subscriberDob,
      eligibilityData: results,
      orderId: input.orderId,
      stage: "eligibility_review",
    });
  } else {
    await prisma.insuranceCase.update({
      where: { id: insuranceCase.id },
      data: {
        eligibilityData: results as object,
        eligibilityCheckedAt: new Date(),
        stage: "eligibility_review",
      },
    });
  }

  await addNote(
    insuranceCase.id,
    null,
    `Eligibility check completed — bucket: ${results.bucket}, ${results.medications.length} medications scored`,
    "system",
    { bucket: results.bucket, sourcesUsed: results.sourcesUsed }
  );

  return { case: insuranceCase, results };
}
