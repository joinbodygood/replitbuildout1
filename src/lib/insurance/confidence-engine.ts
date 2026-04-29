import { lookupCoverage, type CoverageRow } from "./coverage-index";
import { applyModifiers, type ProbabilityRange } from "./modifiers";
import { mapToLabel, type ResultLabel, LABEL_DISPLAY } from "./label-mapper";
import { getMedicationByKey, type MedicationKey, type IndicationKey } from "./drug-codes";
import { resolvePipeline, ALL_MEDICATIONS, type IntakeAnswers, type Pipeline } from "./routing";
import { checkCoverage, lookupDrugRxcui } from "./healthcare-gov-client";

export type Freshness = "real_time" | "fresh" | "recent" | "estimated";

export interface MedicationResult {
  medication: MedicationKey;
  brand: string;
  generic: string;
  manufacturer: string;
  fdaIndicationLabel: string;
  status: ResultLabel;
  statusDisplay: string;
  probLow: number;
  probHigh: number;
  paRequired: boolean;
  recommendedIndication: IndicationKey;
  notes: string | null;
  freshness: Freshness;
  source: string;
}

export interface CoverageResult {
  bucket: ResultLabel;
  medications: MedicationResult[];
  insurance: { carrier: string; state: string; planName: string | null; pbm: string | null };
  computedAt: string;
}

const CURRENT_YEAR = new Date().getFullYear();

// Module-level cache for resolved RxCUIs. Populated lazily on first live-lookup
// per medication. `null` cached as a negative result — no retry per request.
const RXCUI_CACHE = new Map<MedicationKey, string | null>();

async function getRxcuiFor(medication: MedicationKey, brand: string): Promise<string | null> {
  if (RXCUI_CACHE.has(medication)) return RXCUI_CACHE.get(medication) ?? null;
  const r = await lookupDrugRxcui(brand);
  RXCUI_CACHE.set(medication, r);
  return r;
}

export function _resetRxcuiCacheForTests(): void { RXCUI_CACHE.clear(); }

function pickBestIndication(med: MedicationKey, intake: IntakeAnswers): IndicationKey {
  const meta = getMedicationByKey(med)!;
  if (meta.fdaIndications.includes("t2d") && intake.diagnoses.includes("t2d")) return "t2d";
  if (meta.fdaIndications.includes("cv") && intake.diagnoses.includes("cvd")) return "cv";
  if (med === "zepbound" && intake.diagnoses.includes("osa")) return "osa";
  if (med === "wegovy" && intake.diagnoses.includes("mash")) return "mash";
  return meta.primaryIndication;
}

function freshnessFor(source: string, lastSeenAt: Date): Freshness {
  if (source === "healthcare_gov_api") return "real_time";
  if (source === "default_fallback") return "estimated";
  const ageDays = (Date.now() - lastSeenAt.getTime()) / (1000*60*60*24);
  if (ageDays < 30) return "fresh";
  if (ageDays < 90) return "recent";
  return "estimated";
}

async function scoreMedication(
  pipeline: Pipeline, intake: IntakeAnswers, medication: MedicationKey
): Promise<MedicationResult> {
  const meta = getMedicationByKey(medication)!;
  const indication = pickBestIndication(medication, intake);

  let row: CoverageRow | null = await lookupCoverage({
    pipeline, carrierKey: intake.carrier, state: intake.state,
    planId: null, medication, indicationKey: indication,
  });
  let source = row?.source ?? "default_fallback";
  let lastSeenAt = row?.lastSeenAt ?? new Date();

  if (pipeline.kind === "aca" && pipeline.useLiveLookup && intake.planName) {
    const rxcui = await getRxcuiFor(medication, meta.brand);
    if (rxcui) {
      const live = await checkCoverage({ year: CURRENT_YEAR, rxcui, planId: intake.planName });
      if (live) {
        const lo = live.covered ? (live.paRequired ? 60 : 80) : 0;
        const hi = live.covered ? (live.paRequired ? 80 : 95) : 0;
        row = {
          probLow: lo, probHigh: hi, paRequired: live.paRequired, stepTherapy: live.stepTherapy,
          status: live.covered ? "coverage_with_pa" : "not_on_formulary",
          notes: `Live Healthcare.gov: ${live.covered ? "covered" : "not covered"}, tier ${live.drugTier ?? "n/a"}.`,
          source: "healthcare_gov_api", lastSeenAt: new Date(), pbm: row?.pbm ?? null,
        };
        source = "healthcare_gov_api";
        lastSeenAt = new Date();
      }
    }
  }

  const baseRange: ProbabilityRange = row ? { probLow: row.probLow, probHigh: row.probHigh } : { probLow: 0, probHigh: 0 };
  const adjusted = applyModifiers(baseRange, intake, medication, indication, { lastSeenAt });
  const status = mapToLabel(adjusted, row?.paRequired ?? true);

  return {
    medication, brand: meta.brand, generic: meta.generic, manufacturer: meta.manufacturer,
    fdaIndicationLabel: meta.fdaIndicationLabel, status, statusDisplay: LABEL_DISPLAY[status],
    probLow: adjusted.probLow, probHigh: adjusted.probHigh, paRequired: row?.paRequired ?? true,
    recommendedIndication: indication, notes: row?.notes ?? null,
    freshness: freshnessFor(source, lastSeenAt), source,
  };
}

export async function calculateCoverage(intake: IntakeAnswers): Promise<CoverageResult> {
  const pipeline = resolvePipeline(intake);
  const meds = await Promise.all(ALL_MEDICATIONS.map(m => scoreMedication(pipeline, intake, m)));
  const order: ResultLabel[] = ["high_probability", "coverage_with_pa", "unlikely", "not_on_formulary"];
  const bucket = order.find(s => meds.some(m => m.status === s)) ?? "not_on_formulary";
  return {
    bucket, medications: meds,
    insurance: { carrier: intake.carrier, state: intake.state, planName: intake.planName, pbm: null },
    computedAt: new Date().toISOString(),
  };
}
