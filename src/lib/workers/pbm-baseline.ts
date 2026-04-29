import { db } from "@/lib/db";
import { runWorker } from "./shared/worker-runner";
import data from "./pbm-baseline-data.json";

interface Entry { status: string; pa: boolean; probLow: number; probHigh: number; notes?: string; }

const CARRIER_PBM_MAP: Record<string, string> = {
  cigna: "esi", aetna: "cvs_caremark", uhc: "optumrx", humana: "optumrx", bcbs_fl: "esi",
};

export async function run() {
  return runWorker("pbm-baseline", async () => {
    let rowsWritten = 0;

    for (const [pbm, indicationMap] of Object.entries(data.pbms)) {
      for (const [drugIndKey, e] of Object.entries(indicationMap as Record<string, Entry>)) {
        const [medication, ...indParts] = drugIndKey.split("_");
        const indicationKey = indParts.join("_");
        const status = (e.probLow === 0 && e.probHigh === 0) ? "not_on_formulary" : (e.pa ? "coverage_with_pa" : "high_probability");

        for (const [carrierKey, carrierPbm] of Object.entries(CARRIER_PBM_MAP)) {
          if (carrierPbm !== pbm) continue;
          await db.coverageIndex.upsert({
            where: { coverage_index_no_plan: { carrierKey, state: "_default", medication, indicationKey } },
            update: {
              probLow: e.probLow, probHigh: e.probHigh, paRequired: e.pa,
              status: status as never, notes: e.notes ?? null, pbm, source: "pbm_baseline", lastSeenAt: new Date(),
            },
            create: {
              insuranceOrigin: "employer", carrierKey, state: "_default",
              pbm, medication, indicationKey,
              probLow: e.probLow, probHigh: e.probHigh, paRequired: e.pa, stepTherapy: false,
              status: status as never, notes: e.notes ?? null, source: "pbm_baseline",
            },
          });
          rowsWritten++;
        }
      }
    }
    return { rowsWritten };
  });
}

if (require.main === module) {
  run().then(r => console.log("pbm-baseline done:", r)).finally(() => db.$disconnect());
}
