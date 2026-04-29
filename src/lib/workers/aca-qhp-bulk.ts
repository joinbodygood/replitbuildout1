import { db } from "@/lib/db";
import { runWorker } from "./shared/worker-runner";
import { MEDICATIONS } from "@/lib/insurance/drug-codes";
import { lookupDrugRxcui } from "@/lib/insurance/healthcare-gov-client";

const MR_PUF_URL = "https://www.cms.gov/CCIIO/Resources/Data-Resources/Downloads/machine-readable-url-puf.zip";

interface DrugsJsonRow {
  rxnorm_id: string;
  drug_name: string;
  plans: Array<{
    plan_id: string;
    formulary: Array<{
      drug_tier: string;
      prior_authorization: boolean;
      step_therapy: boolean;
      cost_sharing?: Array<{ copay_amount?: string; coinsurance_rate?: string }>;
    }>;
  }>;
}
interface PlanRow { plan_id: string; plan_id_type: string; marketing_name?: string; metal_level?: string; }

async function ensureRxcuis(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  for (const m of MEDICATIONS) {
    const rxcui = await lookupDrugRxcui(m.brand);
    if (rxcui) map.set(rxcui, m.key);
  }
  return map;
}

function tierToProb(tier: string, paRequired: boolean): { probLow: number; probHigh: number; status: string } {
  const t = tier.toUpperCase();
  if (t.includes("EXCLUDED") || t === "" || t === "NOT-COVERED") return { probLow: 0, probHigh: 0, status: "not_on_formulary" };
  if (t.includes("SPECIALTY")) return paRequired ? { probLow: 50, probHigh: 70, status: "coverage_with_pa" } : { probLow: 70, probHigh: 90, status: "high_probability" };
  if (t.includes("PREFERRED")) return paRequired ? { probLow: 60, probHigh: 80, status: "coverage_with_pa" } : { probLow: 75, probHigh: 92, status: "high_probability" };
  return paRequired ? { probLow: 45, probHigh: 65, status: "coverage_with_pa" } : { probLow: 65, probHigh: 85, status: "high_probability" };
}

export async function run() {
  return runWorker("aca-qhp-bulk", async () => {
    let rowsWritten = 0;

    const mrPufRes = await fetch(MR_PUF_URL);
    if (!mrPufRes.ok) throw new Error(`MR-PUF fetch failed: ${mrPufRes.status}`);
    const buf = Buffer.from(await mrPufRes.arrayBuffer());
    const AdmZip = (await import("adm-zip")).default;
    const zip = new AdmZip(buf);
    const csvEntry = zip.getEntries().find(e => e.entryName.toLowerCase().endsWith(".csv"));
    if (!csvEntry) throw new Error("No CSV in MR-PUF zip");
    const csv = csvEntry.getData().toString("utf8");
    const lines = csv.split("\n").slice(1).filter(Boolean);

    const issuers = lines.map(l => {
      const parts = l.split(",").map(p => p.replace(/^"|"$/g, ""));
      return { issuerId: parts[0], state: parts[1], formularyUrl: parts[3], planUrl: parts[4] };
    });

    const rxcuiMap = await ensureRxcuis();
    if (rxcuiMap.size === 0) throw new Error("No RxCUIs resolved — check HEALTHCARE_GOV_API_KEY");

    for (const issuer of issuers) {
      try {
        const [drugsRes, plansRes] = await Promise.all([
          fetch(issuer.formularyUrl).then(r => r.ok ? r.json() : null),
          fetch(issuer.planUrl).then(r => r.ok ? r.json() : null),
        ]);
        if (!drugsRes || !plansRes) continue;

        const drugs = drugsRes as DrugsJsonRow[];
        const plans = plansRes as PlanRow[];

        for (const p of plans) {
          await db.acaPlanDirectory.upsert({
            where: { planId: p.plan_id },
            update: { planName: p.marketing_name ?? p.plan_id, metalLevel: p.metal_level ?? null, lastSeenAt: new Date() },
            create: {
              planId: p.plan_id,
              carrierKey: issuer.issuerId,
              state: issuer.state,
              planName: p.marketing_name ?? p.plan_id,
              metalLevel: p.metal_level ?? null,
              planYear: new Date().getFullYear(),
            },
          });
        }

        for (const drug of drugs) {
          const medKey = rxcuiMap.get(drug.rxnorm_id);
          if (!medKey) continue;
          for (const plan of drug.plans) {
            const formulary = plan.formulary[0];
            if (!formulary) continue;
            const { probLow, probHigh, status } = tierToProb(formulary.drug_tier, formulary.prior_authorization);
            await db.coverageIndex.upsert({
              where: { coverage_index_with_plan: { planId: plan.plan_id, medication: medKey, indicationKey: "weight_loss" } },
              update: {
                probLow, probHigh, status: status as never, paRequired: formulary.prior_authorization,
                stepTherapy: formulary.step_therapy, source: "qhp_file", lastSeenAt: new Date(),
              },
              create: {
                insuranceOrigin: "aca", carrierKey: issuer.issuerId, state: issuer.state,
                planId: plan.plan_id, medication: medKey, indicationKey: "weight_loss",
                probLow, probHigh, status: status as never,
                paRequired: formulary.prior_authorization,
                stepTherapy: formulary.step_therapy,
                source: "qhp_file",
              },
            });
            rowsWritten++;
          }
        }
      } catch (e) {
        console.error(`Issuer ${issuer.issuerId} failed:`, (e as Error).message);
      }
    }

    return { rowsWritten };
  });
}

if (require.main === module) {
  run().then(r => console.log("aca-qhp-bulk done:", r)).finally(() => db.$disconnect());
}
