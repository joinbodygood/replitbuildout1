import { chromium, type Browser, type BrowserContext, type Page } from "playwright";
import { db } from "@/lib/db";

export interface ScrapedRow {
  medication: string;
  indicationKey: string;
  covered: boolean;
  paRequired: boolean;
  tier: number | null;
  notes?: string;
  evidenceUrl?: string;
}

export abstract class CarrierScraper {
  abstract carrierKey: string;
  abstract state: string;
  protected browser: Browser | null = null;
  protected ctx: BrowserContext | null = null;
  protected page: Page | null = null;

  async start() {
    this.browser = await chromium.launch({ headless: true });
    this.ctx = await this.browser.newContext({
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    });
    this.page = await this.ctx.newPage();
  }

  async stop() {
    await this.ctx?.close();
    await this.browser?.close();
  }

  abstract scrape(): Promise<ScrapedRow[]>;

  async writeRows(rows: ScrapedRow[]): Promise<number> {
    let written = 0;
    for (const r of rows) {
      const probLow = r.covered ? (r.paRequired ? 50 : 70) : 0;
      const probHigh = r.covered ? (r.paRequired ? 75 : 90) : 0;
      const status = !r.covered ? "not_on_formulary" : (r.paRequired ? "coverage_with_pa" : "high_probability");
      const existing = await db.coverageIndex.findFirst({
        where: { carrierKey: this.carrierKey, state: this.state, medication: r.medication, indicationKey: r.indicationKey, planId: null },
      });
      if (existing) {
        await db.coverageIndex.update({
          where: { id: existing.id },
          data: {
            probLow, probHigh, paRequired: r.paRequired, tier: r.tier,
            status: status as never, notes: r.notes ?? null, sourceEvidenceUrl: r.evidenceUrl ?? null,
            source: "carrier_scrape", lastSeenAt: new Date(),
          },
        });
      } else {
        await db.coverageIndex.create({
          data: {
            insuranceOrigin: "employer", carrierKey: this.carrierKey, state: this.state,
            medication: r.medication, indicationKey: r.indicationKey,
            probLow, probHigh, paRequired: r.paRequired, stepTherapy: false, tier: r.tier,
            status: status as never, notes: r.notes ?? null, sourceEvidenceUrl: r.evidenceUrl ?? null,
            source: "carrier_scrape",
          },
        });
      }
      written++;
    }
    return written;
  }
}
