import { describe, it, expect } from "vitest";
import { applyModifiers } from "./modifiers";
import type { IntakeAnswers } from "./routing";

const base: IntakeAnswers = {
  insuranceOrigin: "employer", carrier: "cigna", state: "FL", zip: "33101",
  planName: null, planId: null, employerName: "ACME", employerSize: "500_4999",
  diagnoses: [], heightInches: 66, weightLb: 220, // BMI ~35.5
  contact: { firstName: "T", email: "t@x.com", phone: null, smsConsent: false, emailConsent: true }, utm: {},
};
const fresh = { lastSeenAt: new Date() };

describe("modifiers", () => {
  it("baseline unchanged when no modifier triggers", () => {
    const o = applyModifiers({ probLow: 50, probHigh: 60 }, base, "wegovy", "weight_loss", fresh);
    expect(o.probLow).toBe(50); expect(o.probHigh).toBe(60);
  });
  it("5000+ employer +15%", () => {
    const o = applyModifiers({ probLow: 50, probHigh: 60 }, { ...base, employerSize: "5000_plus" }, "wegovy", "weight_loss", fresh);
    expect(o.probLow).toBe(58); expect(o.probHigh).toBe(69);
  });
  it("<500 employer -30%", () => {
    const o = applyModifiers({ probLow: 50, probHigh: 60 }, { ...base, employerSize: "lt_500" }, "wegovy", "weight_loss", fresh);
    expect(o.probLow).toBe(35); expect(o.probHigh).toBe(42);
  });
  it("ACA halves probability", () => {
    const o = applyModifiers({ probLow: 40, probHigh: 60 }, { ...base, insuranceOrigin: "aca", employerSize: null }, "wegovy", "weight_loss", fresh);
    expect(o.probLow).toBe(20); expect(o.probHigh).toBe(30);
  });
  it("T2D pathway +30%", () => {
    const o = applyModifiers({ probLow: 60, probHigh: 80 }, { ...base, diagnoses: ["t2d"] }, "ozempic", "t2d", fresh);
    expect(o.probLow).toBe(78); expect(o.probHigh).toBe(99);
  });
  it("BMI 27-29 no comorbidity halves WL meds", () => {
    const intake = { ...base, heightInches: 70, weightLb: 200 }; // ~28.7
    const o = applyModifiers({ probLow: 50, probHigh: 60 }, intake, "wegovy", "weight_loss", fresh);
    expect(o.probLow).toBe(25);
  });
  it("stale data >90d penalty 0.85", () => {
    const old = { lastSeenAt: new Date(Date.now() - 100*24*3600*1000) };
    const o = applyModifiers({ probLow: 50, probHigh: 60 }, base, "wegovy", "weight_loss", old);
    expect(o.probLow).toBe(43);
  });
  it("0/0 stays 0/0 regardless", () => {
    const o = applyModifiers({ probLow: 0, probHigh: 0 }, { ...base, employerSize: "5000_plus" }, "foundayo", "weight_loss", fresh);
    expect(o.probLow).toBe(0); expect(o.probHigh).toBe(0);
  });
});
