import { createCipheriv, createDecipheriv, randomBytes, createHash } from "node:crypto";

const ALGO = "aes-256-gcm";
const IV_LEN = 12;

function getKey(): Buffer {
  const k = process.env.INSURANCE_LEAD_ENCRYPTION_KEY;
  if (!k) throw new Error("INSURANCE_LEAD_ENCRYPTION_KEY env var must be set (32-byte base64-encoded key)");
  const buf = Buffer.from(k, "base64");
  if (buf.length !== 32) throw new Error("INSURANCE_LEAD_ENCRYPTION_KEY must decode to exactly 32 bytes");
  return buf;
}

export function encrypt(plaintext: string): string {
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, getKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  // Format: base64(iv | tag | ciphertext)
  return Buffer.concat([iv, tag, ciphertext]).toString("base64");
}

export function decrypt(payload: string): string {
  const buf = Buffer.from(payload, "base64");
  const iv = buf.subarray(0, IV_LEN);
  const tag = buf.subarray(IV_LEN, IV_LEN + 16);
  const ciphertext = buf.subarray(IV_LEN + 16);
  const decipher = createDecipheriv(ALGO, getKey(), iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plaintext.toString("utf8");
}

export function hashEmail(email: string): string {
  return createHash("sha256").update(email.toLowerCase().trim()).digest("hex");
}
