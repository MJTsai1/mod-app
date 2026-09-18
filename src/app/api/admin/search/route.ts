import { NextResponse } from "next/server";
import { getStaffSession } from "@/lib/staffAuth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const RESULT_LIMIT_PER_TYPE = 5;
const MIN_QUERY_LENGTH = 2;

export interface SearchResult {
  type: "application" | "report" | "appeal" | "support";
  id: string;
  title: string;
  subtitle: string;
  status: string;
  href: string;
}

export async function GET(request: Request) {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";

  if (q.length < MIN_QUERY_LENGTH) {
    return NextResponse.json({ results: [] });
  }

  const escaped = q.replace(/[%_]/g, (match) => `\\${match}`);
  const supabase = createSupabaseAdminClient();

  const [applications, reports, appeals, support] = await Promise.all([
    supabase
      .from("applications")
      .select("id, reference_code, discord_username, status")
      .or(`discord_username.ilike.%${escaped}%,discord_user_id.ilike.%${escaped}%,reference_code.ilike.%${escaped}%`)
      .order("created_at", { ascending: false })
      .limit(RESULT_LIMIT_PER_TYPE),
    supabase
      .from("reports")
      .select("id, reference_code, reported_discord_username, reporter_discord_username, status")
      .or(
        `reported_discord_username.ilike.%${escaped}%,reporter_discord_username.ilike.%${escaped}%,reference_code.ilike.%${escaped}%`
      )
      .order("created_at", { ascending: false })
      .limit(RESULT_LIMIT_PER_TYPE),
    supabase
      .from("ban_appeals")
      .select("id, reference_code, discord_username, status")
      .or(`discord_username.ilike.%${escaped}%,discord_user_id.ilike.%${escaped}%,reference_code.ilike.%${escaped}%`)
      .order("created_at", { ascending: false })
      .limit(RESULT_LIMIT_PER_TYPE),
    supabase
      .from("support_requests")
      .select("id, reference_code, discord_username, subject, status")
      .or(`discord_username.ilike.%${escaped}%,subject.ilike.%${escaped}%,reference_code.ilike.%${escaped}%`)
      .order("created_at", { ascending: false })
      .limit(RESULT_LIMIT_PER_TYPE),
  ]);

  const results: SearchResult[] = [
    ...(applications.data ?? []).map((row) => ({
      type: "application" as const,
      id: row.id,
      title: row.discord_username,
      subtitle: row.reference_code,
      status: row.status,
      href: `/admin/dashboard/${row.id}`,
    })),
    ...(reports.data ?? []).map((row) => ({
      type: "report" as const,
      id: row.id,
      title: row.reported_discord_username,
      subtitle: `Reported by ${row.reporter_discord_username} · ${row.reference_code}`,
      status: row.status,
      href: `/admin/reports/${row.id}`,
    })),
    ...(appeals.data ?? []).map((row) => ({
      type: "appeal" as const,
      id: row.id,
      title: row.discord_username,
      subtitle: row.reference_code,
      status: row.status,
      href: `/admin/appeals/${row.id}`,
    })),
    ...(support.data ?? []).map((row) => ({
      type: "support" as const,
      id: row.id,
      title: row.discord_username,
      subtitle: `${row.subject} · ${row.reference_code}`,
      status: row.status,
      href: `/admin/support/${row.id}`,
    })),
  ];

  return NextResponse.json({ results });
}
