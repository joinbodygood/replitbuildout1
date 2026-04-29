import { db } from "@/lib/db";
import { runWorker } from "./shared/worker-runner";
import data from "./federal-military-data.json";

interface Entry { covered: boolean; pa: boolean; probLow: number; probHigh: number; notes?: string; }

export async function run() {
  return runWorker("federal-military-sync", async () => {
    let rowsWritten = 0;

    for (const [carrierKey, indicationMap] of Object.entries(data)) {
      for (const [drugIndKey, e] of Object.entries(indicationMap as Record<string, Entry>)) {
        const [medication, ...indParts] = drugIndKey.split("_");
        const indicationKey = indParts.join("_");
        const status = !e.covered ? "not_on_formulary" : (e.pa ? "coverage_with_pa" : "high_probability");

        const existing = await db.coverageIndex.findFirst({
          where: { carrierKey, state: "_default", medication, indicationKey, planId: null },
        });
        if (existing) {
          await db.coverageIndex.update({
            where: { id: existing.id },
            data: {
              probLow: e.probLow, probHigh: e.probHigh, paRequired: e.pa,
              status: status as never, notes: e.notes ?? null, source: "manual", lastSeenAt: new Date(),
            },
          });
        } else {
          await db.coverageIndex.create({
            data: {
              insuranceOrigin: "federal_military", carrierKey, state: "_default",
              medication, indicationKey,
              probLow: e.probLow, probHigh: e.probHigh, paRequired: e.pa, stepTherapy: false,
              status: status as never, notes: e.notes ?? null, source: "manual",
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
  run().then(r => console.log("federal-military-sync done:", r)).finally(() => db.$disconnect());
}
