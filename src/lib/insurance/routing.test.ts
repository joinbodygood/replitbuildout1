import { describe, it, expect } from "vitest";
import { resolvePipeline, computeBmi, type IntakeAnswers } from "./routing";

const base: IntakeAnswers = {
  insuranceOrigin: "employer", carrier: "cigna", state: "FL", zip: "33101",
  planName: null, planId: null, employerName: null, employerSize: null,
  diagnoses: [], heightInches: 65, weightLb: 210,
  contact: { firstName: "T", email: "t@x.com", phone: null, smsConsent: false, emailConsent: true }, utm: {},
};

describe("routing", () => {
  it("self-pay short-circuits", () => {
    expect(resolvePipeline({ ...base, insuranceOrigin: "none" }).kind).toBe("bypass");
  });
  it("ACA + planId → useLiveLookup true", () => {
    const r = resolvePipeline({ ...base, insuranceOrigin: "aca", planName: "X Silver 1", planId: "12345FL0010001" });
    expect(r.kind).toBe("aca");
    if (r.kind === "aca") expect(r.useLiveLookup).toBe(true);
  });
  it("ACA with plan name but no planId → useLiveLookup false (free-text plan, no HIOS id)", () => {
    const r = resolvePipeline({ ...base, insuranceOrigin: "aca", planName: "free-text", planId: null });
    if (r.kind === "aca") expect(r.useLiveLookup).toBe(false);
  });
  it("medicaid maps through", () => {
    expect(resolvePipeline({ ...base, insuranceOrigin: "medicaid" }).kind).toBe("medicaid");
  });
  it("BMI computed correctly", () => {
    expect(computeBmi(70, 200)).toBeCloseTo(28.7, 1);
  });
});
