import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/** Resolves each row's claimed_by staff id into a display name for list views. */
export async function attachClaimerNames<T extends { claimed_by: string | null }>(
  rows: T[]
): Promise<(T & { claimed_by_name: string | null })[]> {
  const ids = Array.from(
    new Set(rows.map((row) => row.claimed_by).filter((id): id is string => Boolean(id)))
  );

  if (ids.length === 0) {
    return rows.map((row) => ({ ...row, claimed_by_name: null }));
  }

  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("staff_members")
    .select("id, display_name, email")
    .in("id", ids);

  const nameMap = new Map((data ?? []).map((staff) => [staff.id, staff.display_name || staff.email]));

  return rows.map((row) => ({
    ...row,
    claimed_by_name: row.claimed_by ? (nameMap.get(row.claimed_by) ?? null) : null,
  }));
}
