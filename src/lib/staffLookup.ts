import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/** Resolves a staff_members id into a human-readable name for "Reviewed by" displays. */
export async function getStaffDisplayName(staffId: string | null): Promise<string | null> {
  if (!staffId) return null;

  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("staff_members")
    .select("display_name, email")
    .eq("id", staffId)
    .maybeSingle();

  if (!data) return null;
  return data.display_name || data.email;
}
