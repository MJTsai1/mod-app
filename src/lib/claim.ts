export interface ClaimCheckResult {
  ok: boolean;
  error?: string;
  status?: number;
  fields?: { claimed_by: string | null; claimed_at: string | null };
}

/** Validates a claim/unclaim request against the item's current claim state. */
export function resolveClaimAction(
  action: "claim" | "unclaim" | undefined,
  currentClaimedBy: string | null,
  staffId: string,
  isAdmin: boolean
): ClaimCheckResult {
  if (!action) return { ok: true };

  if (action === "claim") {
    if (currentClaimedBy && currentClaimedBy !== staffId) {
      return {
        ok: false,
        error: "This is already claimed by another staff member.",
        status: 409,
      };
    }
    return { ok: true, fields: { claimed_by: staffId, claimed_at: new Date().toISOString() } };
  }

  // unclaim
  if (currentClaimedBy && currentClaimedBy !== staffId && !isAdmin) {
    return {
      ok: false,
      error: "Only the staff member who claimed this (or an admin) can unclaim it.",
      status: 403,
    };
  }
  return { ok: true, fields: { claimed_by: null, claimed_at: null } };
}
