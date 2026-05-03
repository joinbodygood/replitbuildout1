/**
 * Task 2 seed script — translate the legacy v1 GLP-1 probability database
 * into the v2 `coverage_index` table.
 *
 * Usage (after `prisma migrate deploy`):
 *   npx tsx scripts/seed-coverage-index.ts
 *
 * Idempotent: re-runs upsert on the same (carrierKey, state, medication, indicationKey)
 * tuple via the partial-unique index `WHERE planId IS NULL`. Uses findFirst + update/create
 * since the named compound key was removed from the Prisma client (see commit f6032f5).
 *
 * Rows written: ~250 (63 carriers × ~4 medications × ~1 state each).
 */
import { db } from "../src/lib/db";
import legacyDb from "./seed-data/glp1-legacy.json";

type LegacyEntry = { prob: [number, number]; rating: string; pa: boolean; notes: string };
type LegacyCarrier = {
  display_name?: string;
  pbm?: string;
  payer_ids?: string[];
  states: Record<string, Record<string, LegacyEntry>>;
};

function classifyOrigin(carrierKey: string): "aca" | "medicare" | "medicaid" | "employer" | "federal_military" {
  if (carrierKey === "medicare") return "medicare";
  if (carrierKey.startsWith("medicaid_")) return "medicaid";
  if (carrierKey === "tricare" || carrierKey === "bcbs_fep" || carrierKey === "va") return "federal_military";
  return "employer";
}

function mapPbm(carrierPbm: string | undefined): string | null {
  if (!carrierPbm) return null;
  const s = carrierPbm.toLowerCase();
  if (s.includes("caremark") || s.includes("cvs")) return "cvs_caremark";
  if (s.includes("express scripts") || s.includes("esi")) return "esi";
  if (s.includes("optumrx") || s.includes("optum")) return "optumrx";
  return null;
}

function mapStatus(probLow: number, probHigh: number, pa: boolean) {
  if (probLow === 0 && probHigh === 0) return "not_on_formulary" as const;
  if (probHigh < 35) return "unlikely" as const;
  if (probLow >= 65 && !pa) return "high_probability" as const;
  return "coverage_with_pa" as const;
}

async function main() {
  const carriers = (legacyDb as unknown as { carriers: Record<string, LegacyCarrier> }).carriers;
  let written = 0, updated = 0, created = 0;

  for (const [carrierKey, carrier] of Object.entries(carriers)) {
    const origin = classifyOrigin(carrierKey);
    const pbm = mapPbm(carrier.pbm);

    for (const [stateKey, indicationMap] of Object.entries(carrier.states)) {
      for (const [drugIndKey, entry] of Object.entries(indicationMap)) {
        // Legacy keys look like "wegovy_weight_loss", "zepbound_osa", etc.
        const [medication, ...indParts] = drugIndKey.split("_");
        const indicationKey = indParts.join("_");
        if (!medication || !indicationKey) continue;

        const status = mapStatus(entry.prob[0], entry.prob[1], entry.pa);

        const existing = await db.coverageIndex.findFirst({
          where: { carrierKey, state: stateKey, medication, indicationKey, planId: null },
        });

        if (existing) {
          await db.coverageIndex.update({
            where: { id: existing.id },
            data: {
              probLow: entry.prob[0],
              probHigh: entry.prob[1],
              paRequired: entry.pa,
              status,
              notes: entry.notes,
              pbm,
              source: "manual",
              lastSeenAt: new Date(),
            },
          });
          updated++;
        } else {
          await db.coverageIndex.create({
            data: {
              insuranceOrigin: origin,
              carrierKey,
              state: stateKey,
              medication,
              indicationKey,
              probLow: entry.prob[0],
              probHigh: entry.prob[1],
              paRequired: entry.pa,
              stepTherapy: false,
              status,
              notes: entry.notes,
              pbm,
              source: "manual",
            },
          });
          created++;
        }
        written++;
      }
    }
  }

  console.log(`Seeded coverage_index from legacy JSON: ${written} total (${created} created, ${updated} updated)`);
}

main()
  .catch(err => {
    console.error("seed-coverage-index failed:", err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
