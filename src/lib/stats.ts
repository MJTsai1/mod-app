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

export interface StaffBreakdownRow {
  staffId: string;
  name: string;
  applications: number;
  reports: number;
  appeals: number;
  total: number;
}

const DECIDED_STATUSES = {
  applications: ["accepted", "rejected"],
  reports: ["resolved", "dismissed"],
  ban_appeals: ["approved", "denied"],
} as const;

/** Counts decided items per staff member (who last updated the status) across all three tables. */
export async function getStaffBreakdown(): Promise<StaffBreakdownRow[]> {
  const supabase = createSupabaseAdminClient();

  const [{ data: staff }, { data: applications }, { data: reports }, { data: appeals }] =
    await Promise.all([
      supabase.from("staff_members").select("id, display_name, email"),
      supabase
        .from("applications")
        .select("last_updated_by")
        .in("status", DECIDED_STATUSES.applications)
        .not("last_updated_by", "is", null),
      supabase
        .from("reports")
        .select("last_updated_by")
        .in("status", DECIDED_STATUSES.reports)
        .not("last_updated_by", "is", null),
      supabase
        .from("ban_appeals")
        .select("last_updated_by")
        .in("status", DECIDED_STATUSES.ban_appeals)
        .not("last_updated_by", "is", null),
    ]);

  function countBy(rows: { last_updated_by: string | null }[] | null): Map<string, number> {
    const counts = new Map<string, number>();
    for (const row of rows ?? []) {
      if (!row.last_updated_by) continue;
      counts.set(row.last_updated_by, (counts.get(row.last_updated_by) ?? 0) + 1);
    }
    return counts;
  }

  const applicationCounts = countBy(applications);
  const reportCounts = countBy(reports);
  const appealCounts = countBy(appeals);

  return (staff ?? [])
    .map((member) => {
      const applicationsCount = applicationCounts.get(member.id) ?? 0;
      const reportsCount = reportCounts.get(member.id) ?? 0;
      const appealsCount = appealCounts.get(member.id) ?? 0;
      return {
        staffId: member.id,
        name: member.display_name || member.email,
        applications: applicationsCount,
        reports: reportsCount,
        appeals: appealsCount,
        total: applicationsCount + reportsCount + appealsCount,
      };
    })
    .filter((row) => row.total > 0)
    .sort((a, b) => b.total - a.total);
}
