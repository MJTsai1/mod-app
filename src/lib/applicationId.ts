import crypto from "node:crypto";

/**
 * Human-friendly reference code shown to the submitter, e.g. MOD-2026-AB12CD.
 * Prefix distinguishes submission type: MOD (application), RPT (report),
 * APL (ban appeal).
 */
export function generateReferenceCode(prefix: string = "MOD"): string {
  const year = new Date().getFullYear();
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `${prefix}-${year}-${random}`;
}
