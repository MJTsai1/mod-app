import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ActivityEntityType, ActivityActorType, ActivityLogRow } from "@/lib/supabase/types";

interface LogActivityParams {
  entityType: ActivityEntityType;
  entityId: string;
  actorType: ActivityActorType;
  staffId?: string | null;
  detail: string;
}

/** Records an entry in activity_log. Never throws — logging failures shouldn't block the action that triggered them. */
export async function logActivity({
  entityType,
  entityId,
  actorType,
  staffId,
  detail,
}: LogActivityParams): Promise<void> {
  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("activity_log").insert({
      entity_type: entityType,
      entity_id: entityId,
      actor_type: actorType,
      staff_id: staffId ?? null,
      detail,
    });
    if (error) {
      console.error("Failed to write activity_log entry:", error.message);
    }
  } catch (error) {
    console.error("Unexpected error writing activity_log entry:", error);
  }
}

export interface ActivityHistoryEntry {
  id: number;
  detail: string;
  actorType: ActivityActorType;
  actorName: string;
  createdAt: string;
  entityType: ActivityEntityType;
  entityId: string;
}

async function resolveActorNames(rows: ActivityLogRow[]): Promise<ActivityHistoryEntry[]> {
  const staffIds = Array.from(
    new Set(rows.map((row) => row.staff_id).filter((id): id is string => Boolean(id)))
  );

  let nameMap = new Map<string, string>();
  if (staffIds.length > 0) {
    const supabase = createSupabaseAdminClient();
    const { data: staff } = await supabase
      .from("staff_members")
      .select("id, display_name, email")
      .in("id", staffIds);
    nameMap = new Map((staff ?? []).map((s) => [s.id, s.display_name || s.email]));
  }

  return rows.map((row) => ({
    id: row.id,
    detail: row.detail,
    actorType: row.actor_type,
    actorName:
      row.actor_type === "applicant"
        ? "The submitter"
        : (row.staff_id ? nameMap.get(row.staff_id) : undefined) ?? "A staff member",
    createdAt: row.created_at,
    entityType: row.entity_type,
    entityId: row.entity_id,
  }));
}

/** Fetches an item's activity history (newest first), resolving staff ids to display names. */
export async function getActivityHistory(
  entityType: ActivityEntityType,
  entityId: string
): Promise<ActivityHistoryEntry[]> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("activity_log")
    .select("*")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false })
    .returns<ActivityLogRow[]>();

  if (error || !data) return [];
  return resolveActorNames(data);
}

/** Fetches the most recent activity across all entity types for the global feed. */
export async function getRecentActivity(limit: number = 50): Promise<ActivityHistoryEntry[]> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("activity_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<ActivityLogRow[]>();

  if (error || !data) return [];
  return resolveActorNames(data);
}

const ENTITY_LINKS: Record<ActivityEntityType, string> = {
  application: "/admin/dashboard",
  report: "/admin/reports",
  appeal: "/admin/appeals",
};

export function activityEntityHref(entry: { entityType: ActivityEntityType; entityId: string }): string {
  return `${ENTITY_LINKS[entry.entityType]}/${entry.entityId}`;
}
