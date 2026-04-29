import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    coverageIndex: { findFirst: vi.fn().mockResolvedValue(null) },
    coverageDefault: { findUnique: vi.fn().mockResolvedValue(null) },
    acaPlanDirectory: { findMany: vi.fn().mockResolvedValue([]) },
  },
}));

import { calculateCoverage, _resetRxcuiCacheForTests } from "./confidence-engine";
import type { IntakeAnswers } from "./routing";

const baseIntake: IntakeAnswers = {
  insuranceOrigin: "employer", carrier: "cigna", state: "FL", zip: "33101",
  planName: null, planId: null, employerName: "ACME", employerSize: "500_4999",
  diagnoses: ["t2d"], heightInches: 66, weightLb: 220,
  contact: { firstName: "T", email: "t@x.com", phone: null, smsConsent: false, emailConsent: true },
  utm: {},
};

beforeEach(() => _resetRxcuiCacheForTests());

describe("calculateCoverage", () => {
  it("returns 5 medication results in canonical order", async () => {
    const r = await calculateCoverage(baseIntake);
    expect(r.medications.map(m => m.medication)).toEqual(["wegovy","zepbound","mounjaro","ozempic","foundayo"]);
  });

  it("with no DB rows, all meds default to not_on_formulary", async () => {
    const r = await calculateCoverage(baseIntake);
    expect(r.medications.every(m => m.status === "not_on_formulary")).toBe(true);
  });

  it("bucket reflects best status across the 5 meds", async () => {
    const r = await calculateCoverage(baseIntake);
    expect(r.bucket).toBe("not_on_formulary"); // all rows are "not_on_formulary"
  });

  it("self-pay short-circuit produces a result", async () => {
    const r = await calculateCoverage({ ...baseIntake, insuranceOrigin: "none" });
    expect(r.bucket).toBeDefined();
    expect(r.medications).toHaveLength(5);
  });

  it("insurance summary echoes intake", async () => {
    const r = await calculateCoverage({ ...baseIntake, planName: "BlueOptions Silver 1234" });
    expect(r.insurance.carrier).toBe("cigna");
    expect(r.insurance.state).toBe("FL");
    expect(r.insurance.planName).toBe("BlueOptions Silver 1234");
  });
});
