import { db } from "@/lib/db";
import { runWorker } from "./shared/worker-runner";
import data from "./medicaid-state-data.json";

interface Entry { covered: boolean; pa?: boolean; probLow?: number; probHigh?: number; notes?: string; url?: string; }

export async function run() {
  return runWorker("medicaid-state", async () => {
    let rowsWritten = 0;

    for (const [state, indicationMap] of Object.entries(data.states)) {
      for (const [drugIndKey, e] of Object.entries(indicationMap as Record<string, Entry>)) {
        const [medication, ...indParts] = drugIndKey.split("_");
        const indicationKey = indParts.join("_");
        const carrierKey = `medicaid_${state.toLowerCase()}`;

        const probLow = e.covered ? (e.probLow ?? 60) : 0;
        const probHigh = e.covered ? (e.probHigh ?? 80) : 0;
        const status = !e.covered ? "not_on_formulary" : (e.pa ? "coverage_with_pa" : "high_probability");

        const existing = await db.coverageIndex.findFirst({
          where: { carrierKey, state, medication, indicationKey, planId: null },
        });
        if (existing) {
          await db.coverageIndex.update({
            where: { id: existing.id },
            data: {
              probLow, probHigh, paRequired: e.pa ?? true, stepTherapy: false,
              status: status as never, notes: e.notes ?? null, source: "medicaid_state",
              sourceEvidenceUrl: e.url ?? null, lastSeenAt: new Date(),
            },
          });
        } else {
          await db.coverageIndex.create({
            data: {
              insuranceOrigin: "medicaid", carrierKey, state,
              medication, indicationKey,
              probLow, probHigh, paRequired: e.pa ?? true, stepTherapy: false,
              status: status as never, notes: e.notes ?? null, source: "medicaid_state",
              sourceEvidenceUrl: e.url ?? null,
            },
          });
        }
        rowsWritten++;
      }
    }

    return { rowsWritten };
  });
}

if (require.main === module) {
  run().then(r => console.log("medicaid-state done:", r)).finally(() => db.$disconnect());
}
