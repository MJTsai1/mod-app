import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface PendingCounts {
  applications: number;
  reports: number;
  appeals: number;
  support: number;
}

/** Counts of pending items for the admin nav badges. */
export async function getPendingCounts(): Promise<PendingCounts> {
  const supabase = createSupabaseAdminClient();

  const [applications, reports, appeals, support] = await Promise.all([
    supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("ban_appeals").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("support_requests").select("id", { count: "exact", head: true }).eq("status", "open"),
  ]);

  return {
    applications: applications.count ?? 0,
    reports: reports.count ?? 0,
    appeals: appeals.count ?? 0,
    support: support.count ?? 0,
  };
}
