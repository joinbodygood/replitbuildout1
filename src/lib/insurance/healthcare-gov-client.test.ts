import { describe, it, expect, vi, afterEach } from "vitest";
import { checkCoverage, lookupDrugRxcui } from "./healthcare-gov-client";

afterEach(() => vi.unstubAllGlobals());

describe("healthcare-gov-client", () => {
  it("checkCoverage returns null when key missing", async () => {
    const old = process.env.HEALTHCARE_GOV_API_KEY;
    delete process.env.HEALTHCARE_GOV_API_KEY;
    expect(await checkCoverage({ year: 2026, rxcui: "1", planId: "p" })).toBeNull();
    if (old) process.env.HEALTHCARE_GOV_API_KEY = old;
  });

  it("checkCoverage parses success", async () => {
    process.env.HEALTHCARE_GOV_API_KEY = "fake";
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({ coverage: [{ covered: true, drug_tier: "SPECIALTY", prior_authorization: true, step_therapy: false, copay_amount: 50 }] }),
    } as Response)));
    const r = await checkCoverage({ year: 2026, rxcui: "1", planId: "p" });
    expect(r?.covered).toBe(true);
    expect(r?.copay).toBe(50);
  });

  it("checkCoverage returns null on network error", async () => {
    process.env.HEALTHCARE_GOV_API_KEY = "fake";
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("network"); }));
    const r = await checkCoverage({ year: 2026, rxcui: "1", planId: "p" });
    expect(r).toBeNull();
  });

  it("lookupDrugRxcui returns first result", async () => {
    process.env.HEALTHCARE_GOV_API_KEY = "fake";
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true, json: async () => ({ drugs: [{ rxcui: "1991302", name: "Wegovy" }] }),
    } as Response)));
    const r = await lookupDrugRxcui("Wegovy");
    expect(r).toBe("1991302");
  });
});
