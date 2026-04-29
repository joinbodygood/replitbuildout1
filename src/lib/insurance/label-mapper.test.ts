import { describe, it, expect } from "vitest";
import { mapToLabel } from "./label-mapper";

describe("label-mapper", () => {
  it("0/0 → not_on_formulary", () => expect(mapToLabel({ probLow: 0, probHigh: 0 }, true)).toBe("not_on_formulary"));
  it("high<35 → unlikely", () => expect(mapToLabel({ probLow: 10, probHigh: 30 }, true)).toBe("unlikely"));
  it("high>=35 + PA → coverage_with_pa", () => expect(mapToLabel({ probLow: 40, probHigh: 60 }, true)).toBe("coverage_with_pa"));
  it("low>=65 + no PA → high_probability", () => expect(mapToLabel({ probLow: 70, probHigh: 90 }, false)).toBe("high_probability"));
  it("low>=65 + PA → coverage_with_pa", () => expect(mapToLabel({ probLow: 70, probHigh: 90 }, true)).toBe("coverage_with_pa"));
});
