import { computeBmi, type IntakeAnswers } from "./routing";
import type { MedicationKey, IndicationKey } from "./drug-codes";
import { isWeightLossMed, isDiabetesMed } from "./drug-codes";

export interface ProbabilityRange { probLow: number; probHigh: number; }
export interface SourceFreshness { lastSeenAt: Date; }

const COMORBIDITY_FOR_BMI_27 = new Set(["t2d","htn","dyslipidemia","cvd"]);

export function applyModifiers(
  base: ProbabilityRange,
  intake: IntakeAnswers,
  medication: MedicationKey,
  indication: IndicationKey,
  freshness: SourceFreshness
): ProbabilityRange {
  let lo = base.probLow, hi = base.probHigh;
  if (lo === 0 && hi === 0) return { probLow: 0, probHigh: 0 };

  if (intake.employerSize === "5000_plus") { lo *= 1.15; hi *= 1.15; }
  else if (intake.employerSize === "lt_500") { lo *= 0.7; hi *= 0.7; }

  if (intake.insuranceOrigin === "aca") { lo *= 0.5; hi *= 0.5; }

  const bmi = computeBmi(intake.heightInches, intake.weightLb);
  const hasComorbidity = intake.diagnoses.some(d => COMORBIDITY_FOR_BMI_27.has(d));
  if (isWeightLossMed(medication)) {
    if (bmi < 27) { lo *= 0.3; hi *= 0.3; }
    else if (bmi < 30 && !hasComorbidity) { lo *= 0.5; hi *= 0.5; }
  }

  if (indication === "t2d" && isDiabetesMed(medication) && intake.diagnoses.includes("t2d")) { lo *= 1.3; hi *= 1.3; }
  if (indication === "cv" && intake.diagnoses.includes("cvd")) { lo *= 1.15; hi *= 1.15; }
  if (medication === "zepbound" && indication === "osa" && intake.diagnoses.includes("osa")) { lo *= 1.10; hi *= 1.10; }
  if (medication === "wegovy" && indication === "mash" && intake.diagnoses.includes("mash")) { lo *= 1.10; hi *= 1.10; }

  const ageDays = (Date.now() - freshness.lastSeenAt.getTime()) / (1000*60*60*24);
  if (ageDays > 90) { lo *= 0.85; hi *= 0.85; }

  return { probLow: Math.min(99, roundFp(lo)), probHigh: Math.min(99, roundFp(hi)) };
}

function roundFp(n: number): number { return Math.round(Math.round(n * 1e10) / 1e10); }
