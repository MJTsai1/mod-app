import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ApplicationFollowupRow, FollowupAuthorType } from "@/lib/supabase/types";

export interface FollowupMessage {
  id: number;
  message: string;
  authorType: FollowupAuthorType;
  authorName: string;
  createdAt: string;
}

/**
 * Fetches an application's applicant-visible follow-up thread (oldest
 * first, like a conversation). `viewerRole` controls attribution: staff
 * viewing see real staff display names and "The applicant"; the applicant
 * viewing their own thread sees "Staff" (never a specific staffer's name)
 * and "You" for their own messages.
 */
export async function getFollowups(
  applicationId: string,
  { viewerRole }: { viewerRole: "staff" | "applicant" }
): Promise<FollowupMessage[]> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("application_followups")
    .select("*")
    .eq("application_id", applicationId)
    .order("created_at", { ascending: true })
    .returns<ApplicationFollowupRow[]>();

  if (error || !data) return [];

  let nameMap = new Map<string, string>();
  if (viewerRole === "staff") {
    const staffIds = Array.from(
      new Set(data.map((row) => row.staff_id).filter((id): id is string => Boolean(id)))
    );
    if (staffIds.length > 0) {
      const { data: staff } = await supabase
        .from("staff_members")
        .select("id, display_name, email")
        .in("id", staffIds);
      nameMap = new Map((staff ?? []).map((s) => [s.id, s.display_name || s.email]));
    }
  }

  return data.map((row) => {
    let authorName: string;
    if (row.author_type === "applicant") {
      authorName = viewerRole === "applicant" ? "You" : "The applicant";
    } else {
      authorName =
        viewerRole === "staff"
          ? (row.staff_id ? nameMap.get(row.staff_id) : undefined) ?? "A staff member"
          : "Staff";
    }
    return { id: row.id, message: row.message, authorType: row.author_type, authorName, createdAt: row.created_at };
  });
}
