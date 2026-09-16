import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { SupportMessageRow, FollowupAuthorType } from "@/lib/supabase/types";

export interface SupportMessage {
  id: number;
  message: string;
  authorType: FollowupAuthorType;
  authorName: string;
  createdAt: string;
}

/**
 * Fetches a support request's two-way message thread (oldest first).
 * `viewerRole` controls attribution: staff viewing see real staff display
 * names and "The member"; the member viewing their own thread sees "Staff"
 * (never a specific staffer's name) and "You" for their own messages.
 */
export async function getSupportMessages(
  supportRequestId: string,
  { viewerRole }: { viewerRole: "staff" | "member" }
): Promise<SupportMessage[]> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("support_messages")
    .select("*")
    .eq("support_request_id", supportRequestId)
    .order("created_at", { ascending: true })
    .returns<SupportMessageRow[]>();

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
      authorName = viewerRole === "member" ? "You" : "The member";
    } else {
      authorName =
        viewerRole === "staff"
          ? (row.staff_id ? nameMap.get(row.staff_id) : undefined) ?? "A staff member"
          : "Staff";
    }
    return { id: row.id, message: row.message, authorType: row.author_type, authorName, createdAt: row.created_at };
  });
}
