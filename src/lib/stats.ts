import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface StatusCounts {
  total: number;
  byStatus: Record<string, number>;
}

/** Counts rows per status value for a table — used by the /admin/stats page. */
export async function getStatusCounts(
  table: "applications" | "reports" | "ban_appeals",
  statuses: readonly string[]
): Promise<StatusCounts> {
  const supabase = createSupabaseAdminClient();

  const results = await Promise.all(
    statuses.map((status) =>
      // Cast needed: this helper spans three tables with different status
      // enum types, which TS can't narrow generically across the union.
      supabase.from(table).select("id", { count: "exact", head: true }).eq("status", status as never)
    )
  );

  const byStatus: Record<string, number> = {};
  let total = 0;
  statuses.forEach((status, index) => {
    const count = results[index].count ?? 0;
    byStatus[status] = count;
    total += count;
  });

  return { total, byStatus };
}
