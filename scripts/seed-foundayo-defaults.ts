/**
 * Task 3 seed script — Foundayo defaults across all carriers + national
 * fallback rows in `coverage_defaults`.
 *
 * Usage (after `prisma migrate deploy` and `seed-coverage-index.ts`):
 *   npx tsx scripts/seed-foundayo-defaults.ts
 *
 * Idempotent: uses findFirst + update/create for coverage_index, native upsert
 * for coverage_default (its unique key is intact).
 *
 * Rows written:
 *   - ~154 Foundayo "not_on_formulary" rows (14 carriers × 11 states)
 *   - 8 coverage_defaults (national fallback per medication × indication)
 */
import { db } from "../src/lib/db";

const ALL_CARRIER_KEYS = [
  "cigna", "bcbs_fl", "aetna", "uhc", "humana",
  "bcbs_fep", "tricare", "va",
  "medicare",
  "medicaid_fl", "medicaid_ny", "medicaid_ca", "medicaid_tx", "medicaid_il",
];

const ALL_STATES = ["FL", "NY", "CA", "TX", "IL", "GA", "NC", "PA", "OH", "VA", "_default"];

function originForCarrier(carrierKey: string): "aca" | "medicare" | "medicaid" | "employer" | "federal_military" {
  if (carrierKey === "medicare") return "medicare";
  if (carrierKey.startsWith("medicaid_")) return "medicaid";
  if (["tricare", "va", "bcbs_fep"].includes(carrierKey)) return "federal_military";
  return "employer";
}

async function main() {
  let foundayoCreated = 0, foundayoUpdated = 0;

  for (const carrierKey of ALL_CARRIER_KEYS) {
    const insuranceOrigin = originForCarrier(carrierKey);
    for (const state of ALL_STATES) {
      const existing = await db.coverageIndex.findFirst({
        where: {
          carrierKey,
          state,
          medication: "foundayo",
          indicationKey: "weight_loss",
          planId: null,
        },
      });

      const data = {
        probLow: 0,
        probHigh: 0,
        paRequired: true,
        stepTherapy: false,
        status: "not_on_formulary" as const,
        notes:
          "Foundayo (orforglipron) launched April 2026. Not yet on most formularies. " +
          "Lilly Direct savings card available — $25/mo for commercial insurance, $149/mo self-pay.",
        source: "manual" as const,
        lastSeenAt: new Date(),
      };

      if (existing) {
        await db.coverageIndex.update({ where: { id: existing.id }, data });
        foundayoUpdated++;
      } else {
        await db.coverageIndex.create({
          data: {
            insuranceOrigin,
            carrierKey,
            state,
            medication: "foundayo",
            indicationKey: "weight_loss",
            ...data,
          },
        });
        foundayoCreated++;
      }
    }
  }

  // National fallback rows in coverage_defaults
  const defaults: Array<{
    medication: string;
    indicationKey: string;
    probLow: number;
    probHigh: number;
    paRequired: boolean;
    notes: string;
  }> = [
    { medication: "wegovy", indicationKey: "weight_loss", probLow: 30, probHigh: 50, paRequired: true,
      notes: "National average for commercial carriers. PA + step therapy typical." },
    { medication: "wegovy", indicationKey: "cv", probLow: 50, probHigh: 70, paRequired: true,
      notes: "CV indication pathway lifts approval odds for documented heart-disease patients." },
    { medication: "wegovy", indicationKey: "mash", probLow: 35, probHigh: 55, paRequired: true,
      notes: "MASH indication added 2026; coverage emerging." },
    { medication: "zepbound", indicationKey: "weight_loss", probLow: 25, probHigh: 45, paRequired: true,
      notes: "National average. Some PBMs removed in 2025." },
    { medication: "zepbound", indicationKey: "osa", probLow: 45, probHigh: 65, paRequired: true,
      notes: "OSA pathway requires AHI 15+ sleep study." },
    { medication: "ozempic", indicationKey: "t2d", probLow: 80, probHigh: 92, paRequired: false,
      notes: "T2D coverage near-universal across commercial." },
    { medication: "mounjaro", indicationKey: "t2d", probLow: 78, probHigh: 90, paRequired: true,
      notes: "T2D coverage strong; PA usually required." },
    { medication: "foundayo", indicationKey: "weight_loss", probLow: 0, probHigh: 0, paRequired: true,
      notes: "Newly launched April 2026. Use Lilly Direct savings card." },
  ];

  for (const d of defaults) {
    await db.coverageDefault.upsert({
      where: { medication_indicationKey: { medication: d.medication, indicationKey: d.indicationKey } },
      update: { ...d },
      create: { ...d },
    });
  }

  console.log(
    `Seeded ${foundayoCreated + foundayoUpdated} Foundayo rows (${foundayoCreated} created, ${foundayoUpdated} updated) ` +
    `+ ${defaults.length} coverage_defaults`
  );
}

main()
  .catch(err => {
    console.error("seed-foundayo-defaults failed:", err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
