import { CarrierScraper, type ScrapedRow } from "./playwright-base";
import { runWorker } from "../shared/worker-runner";
import { db } from "@/lib/db";

const SEARCH_URL = "https://www.uhc.com/pharmacy/drug-coverage";

const QUERIES = [
  { medication: "wegovy", indicationKey: "weight_loss", term: "Wegovy" },
  { medication: "zepbound", indicationKey: "weight_loss", term: "Zepbound" },
  { medication: "ozempic", indicationKey: "t2d", term: "Ozempic" },
  { medication: "mounjaro", indicationKey: "t2d", term: "Mounjaro" },
  { medication: "foundayo", indicationKey: "weight_loss", term: "Foundayo" },
];

class UhcScraper extends CarrierScraper {
  carrierKey = "uhc";
  state = "_default";

  async scrape(): Promise<ScrapedRow[]> {
    if (!this.page) throw new Error("Page not initialized");
    const out: ScrapedRow[] = [];
    for (const q of QUERIES) {
      await this.page.goto(SEARCH_URL, { waitUntil: "networkidle", timeout: 30000 });
      await this.page.fill('input[name="drugName"]', q.term);
      await this.page.click('button[type="submit"]');
      await this.page.waitForLoadState("networkidle");

      const noFound = await this.page.locator('text="not found"').count();
      if (noFound > 0) {
        out.push({ medication: q.medication, indicationKey: q.indicationKey, covered: false, paRequired: true, tier: null, evidenceUrl: SEARCH_URL });
        continue;
      }
      const tierText = await this.page.locator('.tier-label').first().textContent().catch(() => null);
      const tier = Number((tierText ?? "").replace(/\D/g, "")) || null;
      const paText = await this.page.locator('.pa-indicator').first().textContent().catch(() => "");
      const paRequired = !!(paText && paText.toLowerCase().includes("required"));
      out.push({ medication: q.medication, indicationKey: q.indicationKey, covered: true, paRequired, tier, evidenceUrl: SEARCH_URL });
    }
    return out;
  }
}

export async function run() {
  return runWorker("carrier-uhc", async () => {
    const s = new UhcScraper();
    await s.start();
    try {
      const rows = await s.scrape();
      const written = await s.writeRows(rows);
      return { rowsWritten: written };
    } finally { await s.stop(); }
  });
}

if (require.main === module) {
  run().then(r => console.log("uhc done:", r)).finally(() => db.$disconnect());
}
