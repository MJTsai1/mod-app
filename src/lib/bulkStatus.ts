import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logActivity } from "@/lib/activityLog";
import type { ActivityEntityType } from "@/lib/supabase/types";

interface BulkStatusConfig {
  table: "applications" | "reports" | "ban_appeals";
  entityType: ActivityEntityType;
}

/** Updates status on many rows at once, logging one activity entry per affected item. */
export async function bulkUpdateStatus(
  ids: string[],
  status: string,
  staffId: string,
  config: BulkStatusConfig
): Promise<{ updated: number }> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from(config.table)
    // Cast needed: this helper spans three tables with different status
    // enum types, which TS can't narrow generically across the union.
    .update({ status: status as never, last_updated_by: staffId })
    .in("id", ids)
    .select("id");

  if (error) {
    console.error(`Bulk status update failed (${config.table}):`, error.message);
    return { updated: 0 };
  }

  const updatedIds = (data ?? []).map((row) => row.id as string);
  for (const id of updatedIds) {
    logActivity({
      entityType: config.entityType,
      entityId: id,
      actorType: "staff",
      staffId,
      detail: `Status changed to ${status} (bulk update)`,
    }).catch(() => {});
  }

  return { updated: updatedIds.length };
}
