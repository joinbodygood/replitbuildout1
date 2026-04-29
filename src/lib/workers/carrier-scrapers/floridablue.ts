import { CarrierScraper, type ScrapedRow } from "./playwright-base";
import { runWorker } from "../shared/worker-runner";
import { db } from "@/lib/db";

const SEARCH_URL = "https://www.floridablue.com/members/tools-resources/pharmacy/drug-list";

const QUERIES = [
  { medication: "wegovy", indicationKey: "weight_loss", term: "Wegovy" },
  { medication: "zepbound", indicationKey: "weight_loss", term: "Zepbound" },
  { medication: "ozempic", indicationKey: "t2d", term: "Ozempic" },
  { medication: "mounjaro", indicationKey: "t2d", term: "Mounjaro" },
  { medication: "foundayo", indicationKey: "weight_loss", term: "Foundayo" },
];

class FloridaBlueScraper extends CarrierScraper {
  carrierKey = "bcbs_fl";
  state = "FL";

  async scrape(): Promise<ScrapedRow[]> {
    if (!this.page) throw new Error("Page not initialized");
    const out: ScrapedRow[] = [];

    for (const q of QUERIES) {
      await this.page.goto(SEARCH_URL, { waitUntil: "networkidle", timeout: 30000 });
      await this.page.fill('input[name="drugSearch"]', q.term);
      await this.page.press('input[name="drugSearch"]', "Enter");
      await this.page.waitForSelector(".drug-result, .no-results", { timeout: 15000 });

      const noResults = await this.page.locator(".no-results").count();
      if (noResults > 0) {
        out.push({ medication: q.medication, indicationKey: q.indicationKey, covered: false, paRequired: true, tier: null, notes: "Not found in Florida Blue formulary search.", evidenceUrl: SEARCH_URL });
        continue;
      }

      const tierText = await this.page.locator(".drug-result .tier").first().textContent();
      const paText = await this.page.locator(".drug-result .pa-flag").first().textContent().catch(() => null);

      const tier = Number((tierText ?? "").replace(/\D/g, "")) || null;
      const paRequired = !!paText;
      out.push({ medication: q.medication, indicationKey: q.indicationKey, covered: true, paRequired, tier, evidenceUrl: SEARCH_URL });
    }

    return out;
  }
}

export async function run() {
  return runWorker("carrier-floridablue", async () => {
    const s = new FloridaBlueScraper();
    await s.start();
    try {
      const rows = await s.scrape();
      const written = await s.writeRows(rows);
      return { rowsWritten: written };
    } finally {
      await s.stop();
    }
  });
}

if (require.main === module) {
  run().then(r => console.log("floridablue done:", r)).finally(() => db.$disconnect());
}
