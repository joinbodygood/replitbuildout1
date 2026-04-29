import { db } from "@/lib/db";
import { runWorker } from "./shared/worker-runner";
import { MEDICATIONS } from "@/lib/insurance/drug-codes";

const CMS_PARTD_URL = process.env.CMS_PARTD_URL ?? "";

export async function run() {
  return runWorker("medicare-part-d", async () => {
    if (!CMS_PARTD_URL) {
      throw new Error("CMS_PARTD_URL env var must be set to current monthly file URL (rotates monthly)");
    }
    let rowsWritten = 0;

    const res = await fetch(CMS_PARTD_URL);
    if (!res.ok) throw new Error(`CMS Part D fetch failed: ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const AdmZip = (await import("adm-zip")).default;
    const zip = new AdmZip(buf);

    const ndcMap = new Map<string, string>();
    for (const m of MEDICATIONS) {
      for (const ndc of m.ndcs) ndcMap.set(ndc.replace(/-/g, ""), m.key);
    }

    const basic = zip.getEntries().find(e => e.entryName.toLowerCase().includes("basic_drugs"));
    const indication = zip.getEntries().find(e => e.entryName.toLowerCase().includes("indication_based"));
    if (!basic) throw new Error("basic_drugs_formulary file not found in zip");

    const basicLines = basic.getData().toString("utf8").split("\n").slice(1);
    for (const line of basicLines) {
      const parts = line.split("|");
      const ndc = (parts[4] ?? "").replace(/-/g, "");
      const medKey = ndcMap.get(ndc);
      if (!medKey) continue;
      const tier = Number(parts[5]);
      const paRequired = parts[7] === "Y";
      const stepTherapy = parts[8] === "Y";
      const indicationKey = medKey === "ozempic" || medKey === "mounjaro" ? "t2d" : "weight_loss";

      const probLow = tier <= 2 ? 75 : tier <= 4 ? 60 : 40;
      const probHigh = tier <= 2 ? 92 : tier <= 4 ? 80 : 65;

      await db.coverageIndex.upsert({
        where: { coverage_index_with_plan: { planId: parts[0], medication: medKey, indicationKey } },
        update: {
          tier, probLow, probHigh, paRequired, stepTherapy,
          status: paRequired ? "coverage_with_pa" as never : "high_probability" as never,
          source: "medicare_part_d", lastSeenAt: new Date(),
        },
        create: {
          insuranceOrigin: "medicare", carrierKey: "medicare", state: "_default",
          planId: parts[0], medication: medKey, indicationKey,
          tier, probLow, probHigh, paRequired, stepTherapy,
          status: paRequired ? "coverage_with_pa" as never : "high_probability" as never,
          source: "medicare_part_d",
        },
      });
      rowsWritten++;
    }

    if (indication) {
      const indLines = indication.getData().toString("utf8").split("\n").slice(1);
      for (const line of indLines) {
        const parts = line.split("|");
        const ndc = (parts[4] ?? "").replace(/-/g, "");
        const medKey = ndcMap.get(ndc);
        if (!medKey) continue;
        const indicationName = (parts[10] ?? "").toLowerCase();
        let indicationKey: string;
        if (indicationName.includes("cardiovascular")) indicationKey = "cv";
        else if (indicationName.includes("sleep apnea")) indicationKey = "osa";
        else if (indicationName.includes("mash") || indicationName.includes("liver")) indicationKey = "mash";
        else continue;

        await db.coverageIndex.upsert({
          where: { coverage_index_with_plan: { planId: parts[0], medication: medKey, indicationKey } },
          update: { source: "medicare_part_d", lastSeenAt: new Date(), probLow: 65, probHigh: 85, paRequired: true, status: "coverage_with_pa" as never },
          create: {
            insuranceOrigin: "medicare", carrierKey: "medicare", state: "_default",
            planId: parts[0], medication: medKey, indicationKey,
            probLow: 65, probHigh: 85, paRequired: true, stepTherapy: false,
            status: "coverage_with_pa" as never, source: "medicare_part_d",
          },
        });
        rowsWritten++;
      }
    }

    return { rowsWritten };
  });
}

if (require.main === module) {
  run().then(r => console.log("medicare-part-d done:", r)).finally(() => db.$disconnect());
}
