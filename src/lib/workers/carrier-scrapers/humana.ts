import { CarrierScraper, type ScrapedRow } from "./playwright-base";
import { runWorker } from "../shared/worker-runner";
import { db } from "@/lib/db";

const SEARCH_URL = "https://www.humana.com/pharmacy/drug-list";

const QUERIES = [
  { medication: "wegovy", indicationKey: "weight_loss", term: "Wegovy" },
  { medication: "zepbound", indicationKey: "weight_loss", term: "Zepbound" },
  { medication: "ozempic", indicationKey: "t2d", term: "Ozempic" },
  { medication: "mounjaro", indicationKey: "t2d", term: "Mounjaro" },
  { medication: "foundayo", indicationKey: "weight_loss", term: "Foundayo" },
];

class HumanaScraper extends CarrierScraper {
  carrierKey = "humana";
  state = "_default";

  async scrape(): Promise<ScrapedRow[]> {
    if (!this.page) throw new Error("Page not initialized");
    const out: ScrapedRow[] = [];
    for (const q of QUERIES) {
      await this.page.goto(SEARCH_URL, { waitUntil: "networkidle", timeout: 30000 });
      await this.page.fill('input[type="search"]', q.term);
      await this.page.press('input[type="search"]', "Enter");
      await this.page.waitForLoadState("networkidle");

      const noResults = await this.page.locator('text="No results"').count();
      if (noResults > 0) {
        out.push({ medication: q.medication, indicationKey: q.indicationKey, covered: false, paRequired: true, tier: null, evidenceUrl: SEARCH_URL });
        continue;
      }
      const tierText = await this.page.locator('.formulary-tier').first().textContent().catch(() => null);
      const tier = Number((tierText ?? "").replace(/\D/g, "")) || null;
      const paText = await this.page.locator('.requires-pa').first().textContent().catch(() => "");
      const paRequired = !!(paText && paText.length > 0);
      out.push({ medication: q.medication, indicationKey: q.indicationKey, covered: true, paRequired, tier, evidenceUrl: SEARCH_URL });
    }
    return out;
  }
}

export async function run() {
  return runWorker("carrier-humana", async () => {
    const s = new HumanaScraper();
    await s.start();
    try {
      const rows = await s.scrape();
      const written = await s.writeRows(rows);
      return { rowsWritten: written };
    } finally { await s.stop(); }
  });
}

if (require.main === module) {
  run().then(r => console.log("humana done:", r)).finally(() => db.$disconnect());
}
