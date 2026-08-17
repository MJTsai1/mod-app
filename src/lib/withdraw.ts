import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logActivity } from "@/lib/activityLog";
import type { ActivityEntityType } from "@/lib/supabase/types";

interface WithdrawConfig {
  table: "applications" | "reports" | "ban_appeals";
  entityType: ActivityEntityType;
  ownerColumn: "applicant_id" | "reporter_id" | "appellant_id";
  /** Terminal statuses (besides "withdrawn" itself) that can no longer be withdrawn. */
  nonWithdrawableStatuses: string[];
}

export interface WithdrawResult {
  ok: boolean;
  error?: string;
  status?: number;
}

/** Lets the original submitter (not staff) withdraw their own application/report/appeal. */
export async function withdrawOwnSubmission(
  userId: string,
  id: string,
  config: WithdrawConfig
): Promise<WithdrawResult> {
  const supabase = createSupabaseAdminClient();

  const { data: row, error: fetchError } = await supabase
    .from(config.table)
    .select(`id, status, ${config.ownerColumn}`)
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !row) {
    return { ok: false, error: "Not found.", status: 404 };
  }

  const record = row as unknown as Record<string, unknown>;
  if (record[config.ownerColumn] !== userId) {
    // Not the owner — respond identically to "not found" so we don't leak existence.
    return { ok: false, error: "Not found.", status: 404 };
  }

  const currentStatus = record.status as string;
  if (currentStatus === "withdrawn") {
    return { ok: false, error: "This has already been withdrawn.", status: 400 };
  }
  if (config.nonWithdrawableStatuses.includes(currentStatus)) {
    return {
      ok: false,
      error: "This has already been decided and can no longer be withdrawn.",
      status: 400,
    };
  }

  const { error: updateError } = await supabase
    .from(config.table)
    .update({ status: "withdrawn" })
    .eq("id", id);

  if (updateError) {
    console.error(`Failed to withdraw ${config.table} ${id}:`, updateError.message);
    return { ok: false, error: "Failed to withdraw. Please try again.", status: 500 };
  }

  logActivity({
    entityType: config.entityType,
    entityId: id,
    actorType: "applicant",
    detail: "Withdrawn by the submitter.",
  }).catch(() => {});

  return { ok: true };
}
