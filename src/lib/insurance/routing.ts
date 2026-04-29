import type { MedicationKey } from "./drug-codes";

export type InsuranceOrigin = "aca" | "medicare" | "medicaid" | "employer" | "federal_military" | "none";

export interface ContactInfo { firstName: string; email: string; phone: string | null; smsConsent: boolean; emailConsent: boolean; }
export interface UtmInfo { source?: string; medium?: string; campaign?: string; }
export interface IntakeAnswers {
  insuranceOrigin: InsuranceOrigin;
  carrier: string;
  state: string;
  zip: string;
  planName: string | null;
  planId: string | null;
  employerName: string | null;
  employerSize: "lt_500" | "500_4999" | "5000_plus" | "unknown" | null;
  diagnoses: Array<"t2d" | "cvd" | "osa" | "htn" | "dyslipidemia" | "mash">;
  heightInches: number;
  weightLb: number;
  contact: ContactInfo;
  utm: UtmInfo;
}

export type Pipeline =
  | { kind: "bypass"; reason: "self_pay" }
  | { kind: "aca"; useLiveLookup: boolean }
  | { kind: "medicare" }
  | { kind: "medicaid" }
  | { kind: "employer" }
  | { kind: "federal_military" };

export function resolvePipeline(intake: IntakeAnswers): Pipeline {
  if (intake.insuranceOrigin === "none") return { kind: "bypass", reason: "self_pay" };
  if (intake.insuranceOrigin === "aca") return { kind: "aca", useLiveLookup: !!intake.planId };
  return { kind: intake.insuranceOrigin };
}

export function computeBmi(heightInches: number, weightLb: number): number {
  if (heightInches <= 0) return 0;
  return Math.round((weightLb / (heightInches * heightInches)) * 703 * 10) / 10;
}

export const ALL_MEDICATIONS: MedicationKey[] = ["wegovy", "zepbound", "mounjaro", "ozempic", "foundayo"];
