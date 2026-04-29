import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockFindFirst, mockFindUnique, mockFindMany } = vi.hoisted(() => ({
  mockFindFirst: vi.fn(),
  mockFindUnique: vi.fn(),
  mockFindMany: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    coverageIndex: { findFirst: mockFindFirst },
    coverageDefault: { findUnique: mockFindUnique },
    acaPlanDirectory: { findMany: mockFindMany },
  },
}));

import { lookupCoverage } from "./coverage-index";

const NOW = new Date("2026-04-01T00:00:00Z");

const sampleRow = {
  probLow: 50, probHigh: 60, paRequired: true, stepTherapy: false,
  status: "coverage_with_pa", notes: "test", source: "manual", lastSeenAt: NOW, pbm: null,
};

beforeEach(() => {
  mockFindFirst.mockReset();
  mockFindUnique.mockReset();
});

describe("lookupCoverage cascade", () => {
  it("returns plan-specific row first when planId provided", async () => {
    mockFindFirst.mockResolvedValueOnce({ ...sampleRow, source: "qhp_file" });
    const r = await lookupCoverage({
      pipeline: { kind: "aca", useLiveLookup: true }, carrierKey: "cigna", state: "FL",
      planId: "12345FL0010001", medication: "wegovy", indicationKey: "weight_loss",
    });
    expect(r?.source).toBe("qhp_file");
    expect(mockFindFirst).toHaveBeenCalledTimes(1);
  });

  it("falls through to (carrier, state) row when no planId", async () => {
    mockFindFirst.mockResolvedValueOnce(sampleRow); // (carrier, state) hit
    const r = await lookupCoverage({
      pipeline: { kind: "employer" }, carrierKey: "cigna", state: "FL",
      planId: null, medication: "wegovy", indicationKey: "weight_loss",
    });
    expect(r?.probLow).toBe(50);
    expect(mockFindFirst).toHaveBeenCalledTimes(1);
  });

  it("falls through to (carrier, _default) when state row missing", async () => {
    mockFindFirst.mockResolvedValueOnce(null); // (carrier, state) miss
    mockFindFirst.mockResolvedValueOnce({ ...sampleRow, source: "pbm_baseline" }); // (carrier, _default) hit
    const r = await lookupCoverage({
      pipeline: { kind: "employer" }, carrierKey: "cigna", state: "FL",
      planId: null, medication: "wegovy", indicationKey: "weight_loss",
    });
    expect(r?.source).toBe("pbm_baseline");
    expect(mockFindFirst).toHaveBeenCalledTimes(2);
  });

  it("falls through to coverage_defaults when no carrier rows", async () => {
    mockFindFirst.mockResolvedValue(null);
    mockFindUnique.mockResolvedValueOnce({
      probLow: 30, probHigh: 50, paRequired: true, notes: "national avg", updatedAt: NOW,
    });
    const r = await lookupCoverage({
      pipeline: { kind: "employer" }, carrierKey: "unknown", state: "FL",
      planId: null, medication: "wegovy", indicationKey: "weight_loss",
    });
    expect(r?.source).toBe("default_fallback");
    expect(r?.probLow).toBe(30);
  });

  it("returns null when bypass pipeline", async () => {
    const r = await lookupCoverage({
      pipeline: { kind: "bypass", reason: "self_pay" }, carrierKey: "cigna", state: "FL",
      planId: null, medication: "wegovy", indicationKey: "weight_loss",
    });
    expect(r).toBeNull();
    expect(mockFindFirst).not.toHaveBeenCalled();
  });

  it("returns null when nothing found anywhere", async () => {
    mockFindFirst.mockResolvedValue(null);
    mockFindUnique.mockResolvedValueOnce(null);
    const r = await lookupCoverage({
      pipeline: { kind: "employer" }, carrierKey: "unknown", state: "ZZ",
      planId: null, medication: "wegovy", indicationKey: "weight_loss",
    });
    expect(r).toBeNull();
  });
});
