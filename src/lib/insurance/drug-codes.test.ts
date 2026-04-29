import { describe, it, expect } from "vitest";
import { MEDICATIONS, getMedicationByKey, isWeightLossMed, isDiabetesMed } from "./drug-codes";

describe("drug-codes", () => {
  it("exposes 5 medications including foundayo", () => {
    expect(MEDICATIONS.map(m => m.key)).toEqual(["wegovy","zepbound","mounjaro","ozempic","foundayo"]);
  });
  it("classifies weight-loss vs diabetes", () => {
    expect(isWeightLossMed("foundayo")).toBe(true);
    expect(isDiabetesMed("ozempic")).toBe(true);
    expect(isDiabetesMed("foundayo")).toBe(false);
  });
  it("getMedicationByKey returns full record", () => {
    const f = getMedicationByKey("foundayo");
    expect(f?.brand).toBe("Foundayo");
    expect(f?.manufacturer).toBe("Eli Lilly");
    expect(f?.form).toBe("oral");
  });
});
