import crypto from "node:crypto";

/** Human-friendly reference code shown to applicants, e.g. MOD-2026-AB12CD. */
export function generateReferenceCode(): string {
  const year = new Date().getFullYear();
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `MOD-${year}-${random}`;
}
