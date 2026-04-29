import { db } from "@/lib/db";
import type { MedicationKey, IndicationKey } from "./drug-codes";
import type { Pipeline } from "./routing";

export interface CoverageRow {
  probLow: number; probHigh: number; paRequired: boolean; stepTherapy: boolean;
  status: string; notes: string | null; source: string; lastSeenAt: Date; pbm: string | null;
}

export async function lookupCoverage(args: {
  pipeline: Pipeline; carrierKey: string; state: string; planId: string | null;
  medication: MedicationKey; indicationKey: IndicationKey;
}): Promise<CoverageRow | null> {
  const { pipeline, carrierKey, state, planId, medication, indicationKey } = args;
  if (pipeline.kind === "bypass") return null;

  if (planId) {
    const r = await db.coverageIndex.findFirst({
      where: { planId, medication, indicationKey }, orderBy: { lastSeenAt: "desc" },
    });
    if (r) return toRow(r);
  }
  const stateRow = await db.coverageIndex.findFirst({
    where: { carrierKey, state, medication, indicationKey, planId: null },
  });
  if (stateRow) return toRow(stateRow);
  const def = await db.coverageIndex.findFirst({
    where: { carrierKey, state: "_default", medication, indicationKey, planId: null },
  });
  if (def) return toRow(def);
  const fb = await db.coverageDefault.findUnique({
    where: { medication_indicationKey: { medication, indicationKey } },
  });
  if (fb) return {
    probLow: fb.probLow, probHigh: fb.probHigh, paRequired: fb.paRequired, stepTherapy: false,
    status: fb.probLow === 0 && fb.probHigh === 0 ? "not_on_formulary" : "coverage_with_pa",
    notes: fb.notes, source: "default_fallback", lastSeenAt: fb.updatedAt, pbm: null,
  };
  return null;
}

function toRow(r: { probLow: number; probHigh: number; paRequired: boolean; stepTherapy: boolean;
  status: string; notes: string | null; source: string; lastSeenAt: Date; pbm: string | null; }): CoverageRow {
  return { ...r };
}

export async function searchPlansForAutocomplete(args: { carrierKey: string; state: string; query: string }) {
  return db.acaPlanDirectory.findMany({
    where: { carrierKey: args.carrierKey, state: args.state, planName: { contains: args.query, mode: "insensitive" } },
    take: 8, orderBy: { planName: "asc" },
  });
}
