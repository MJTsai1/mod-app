import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ActivityEntityType, CaseNoteRow } from "@/lib/supabase/types";

export interface CaseNote {
  id: number;
  note: string;
  authorName: string;
  createdAt: string;
}

/** Fetches a threaded note history (newest first), resolving staff ids to display names. */
export async function getCaseNotes(
  entityType: ActivityEntityType,
  entityId: string
): Promise<CaseNote[]> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("case_notes")
    .select("*")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false })
    .returns<CaseNoteRow[]>();

  if (error || !data) return [];

  const staffIds = Array.from(
    new Set(data.map((row) => row.staff_id).filter((id): id is string => Boolean(id)))
  );

  let nameMap = new Map<string, string>();
  if (staffIds.length > 0) {
    const { data: staff } = await supabase
      .from("staff_members")
      .select("id, display_name, email")
      .in("id", staffIds);
    nameMap = new Map((staff ?? []).map((s) => [s.id, s.display_name || s.email]));
  }

  return data.map((row) => ({
    id: row.id,
    note: row.note,
    authorName: (row.staff_id ? nameMap.get(row.staff_id) : undefined) ?? "A staff member",
    createdAt: row.created_at,
  }));
}
