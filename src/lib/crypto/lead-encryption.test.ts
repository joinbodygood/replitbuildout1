import { describe, it, expect, beforeAll } from "vitest";
import { encrypt, decrypt, hashEmail } from "./lead-encryption";

beforeAll(() => {
  // Set a test-only key (32 bytes base64 = 44 chars)
  process.env.INSURANCE_LEAD_ENCRYPTION_KEY = Buffer.alloc(32, 1).toString("base64");
});

describe("lead-encryption", () => {
  it("encrypts and decrypts round-trip", () => {
    const ct = encrypt("jane@example.com");
    expect(ct).not.toBe("jane@example.com");
    expect(decrypt(ct)).toBe("jane@example.com");
  });

  it("produces different ciphertext on repeated calls (random IV)", () => {
    const a = encrypt("hello");
    const b = encrypt("hello");
    expect(a).not.toBe(b);
    expect(decrypt(a)).toBe("hello");
    expect(decrypt(b)).toBe("hello");
  });

  it("hashEmail is case-insensitive and trimmed", () => {
    expect(hashEmail("JANE@example.com")).toBe(hashEmail("  jane@example.com  "));
  });

  it("decrypt throws on tampered ciphertext", () => {
    const ct = encrypt("secret");
    const tampered = ct.substring(0, ct.length - 4) + "AAAA";
    expect(() => decrypt(tampered)).toThrow();
  });
});
