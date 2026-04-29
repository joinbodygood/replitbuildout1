import { CarrierScraper, type ScrapedRow } from "./playwright-base";
import { runWorker } from "../shared/worker-runner";
import { db } from "@/lib/db";

const SEARCH_URL = "https://www.aetna.com/individuals-families/find-a-medication.html";

const QUERIES = [
  { medication: "wegovy", indicationKey: "weight_loss", term: "Wegovy" },
  { medication: "zepbound", indicationKey: "weight_loss", term: "Zepbound" },
  { medication: "ozempic", indicationKey: "t2d", term: "Ozempic" },
  { medication: "mounjaro", indicationKey: "t2d", term: "Mounjaro" },
  { medication: "foundayo", indicationKey: "weight_loss", term: "Foundayo" },
];

class AetnaScraper extends CarrierScraper {
  carrierKey = "aetna";
  state = "_default";

  async scrape(): Promise<ScrapedRow[]> {
    if (!this.page) throw new Error("Page not initialized");
    const out: ScrapedRow[] = [];
    for (const q of QUERIES) {
      await this.page.goto(SEARCH_URL, { waitUntil: "networkidle", timeout: 30000 });
      await this.page.fill('input[type="search"]', q.term);
      await this.page.press('input[type="search"]', "Enter");
      await this.page.waitForLoadState("networkidle");

      const found = await this.page.locator('[data-testid="drug-tier"]').first().textContent().catch(() => null);
      if (!found) {
        out.push({ medication: q.medication, indicationKey: q.indicationKey, covered: false, paRequired: true, tier: null, evidenceUrl: SEARCH_URL });
        continue;
      }
      const tier = Number((found ?? "").replace(/\D/g, "")) || null;
      const paText = await this.page.locator('[data-testid="pa-required"]').first().textContent().catch(() => "");
      const paRequired = !!(paText && paText.toLowerCase().includes("yes"));
      out.push({ medication: q.medication, indicationKey: q.indicationKey, covered: true, paRequired, tier, evidenceUrl: SEARCH_URL });
    }
    return out;
  }
}

export async function run() {
  return runWorker("carrier-aetna", async () => {
    const s = new AetnaScraper();
    await s.start();
    try {
      const rows = await s.scrape();
      const written = await s.writeRows(rows);
      return { rowsWritten: written };
    } finally { await s.stop(); }
  });
}

if (require.main === module) {
  run().then(r => console.log("aetna done:", r)).finally(() => db.$disconnect());
}
