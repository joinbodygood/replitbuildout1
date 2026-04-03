import { db as prisma } from "@/lib/db";
import type { ClinicalInput } from "./types";

function calculateHomaIr(insulin?: number, glucose?: number): number | null {
  if (!insulin || !glucose) return null;
  return Math.round(((insulin * glucose) / 405) * 10) / 10;
}

export async function upsertClinical(caseId: string, data: ClinicalInput) {
  const homaIr = calculateHomaIr(data.fastingInsulin, data.fastingGlucose);

  return prisma.patientClinicalData.upsert({
    where: { caseId },
    create: {
      caseId,
      bmi: data.bmi,
      a1c: data.a1c,
      fastingGlucose: data.fastingGlucose,
      fastingInsulin: data.fastingInsulin,
      triglycerides: data.triglycerides,
      hdl: data.hdl,
      homaIr,
      diagnoses: data.diagnoses ?? [],
      priorTreatments: data.priorTreatments ?? [],
      clinicalNotes: data.clinicalNotes,
    },
    update: {
      bmi: data.bmi,
      a1c: data.a1c,
      fastingGlucose: data.fastingGlucose,
      fastingInsulin: data.fastingInsulin,
      triglycerides: data.triglycerides,
      hdl: data.hdl,
      homaIr,
      diagnoses: data.diagnoses ?? [],
      priorTreatments: data.priorTreatments ?? [],
      clinicalNotes: data.clinicalNotes,
    },
  });
}

export function autoDetectDiagnoses(clinical: {
  bmi?: number | null;
  a1c?: number | null;
  fastingGlucose?: number | null;
  fastingInsulin?: number | null;
  triglycerides?: number | null;
  hdl?: number | null;
  homaIr?: number | null;
}): string[] {
  const dx: string[] = [];

  if (clinical.bmi) {
    if (clinical.bmi >= 40) dx.push("obesity_c3");
    else if (clinical.bmi >= 35) dx.push("obesity_c2");
    else if (clinical.bmi >= 30) dx.push("obesity_c1");
  }

  if (clinical.a1c) {
    if (clinical.a1c >= 6.5) dx.push("t2dm");
    else if (clinical.a1c >= 5.7) dx.push("prediabetes");
  }

  const homaIr = clinical.homaIr ?? calculateHomaIr(
    clinical.fastingInsulin ?? undefined,
    clinical.fastingGlucose ?? undefined
  );
  if (homaIr && homaIr > 2.5) dx.push("hyperinsulinemia");

  if (clinical.triglycerides && clinical.triglycerides > 150) dx.push("high_trig");
  if (clinical.hdl && clinical.hdl < 40) dx.push("low_hdl");

  if (dx.includes("high_trig") || dx.includes("low_hdl")) dx.push("dyslipidemia");

  const metSynMarkers = [
    dx.some((d) => d.startsWith("obesity")),
    dx.includes("high_trig"),
    dx.includes("low_hdl"),
    dx.includes("prediabetes") || dx.includes("t2dm"),
    dx.includes("hyperinsulinemia"),
  ].filter(Boolean).length;

  if (metSynMarkers >= 3) dx.push("metabolic_syn");

  return [...new Set(dx)];
}
