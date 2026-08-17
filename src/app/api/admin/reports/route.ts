import { NextResponse } from "next/server";
import { getStaffSession } from "@/lib/staffAuth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { reportStatusValues } from "@/lib/validation/report";
import { attachClaimerNames } from "@/lib/attachClaimerNames";

export const dynamic = "force-dynamic";

const PAGE_SIZE_DEFAULT = 20;
const PAGE_SIZE_MAX = 100;

export async function GET(request: Request) {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const search = url.searchParams.get("q")?.trim();
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1);
  const pageSize = Math.min(
    PAGE_SIZE_MAX,
    Math.max(1, Number(url.searchParams.get("pageSize") ?? String(PAGE_SIZE_DEFAULT)) || PAGE_SIZE_DEFAULT)
  );

  const supabase = createSupabaseAdminClient();

  let query = supabase
    .from("reports")
    .select(
      "id, reference_code, created_at, reporter_discord_username, reported_discord_username, category, status, claimed_by",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (status && (reportStatusValues as readonly string[]).includes(status)) {
    query = query.eq("status", status as (typeof reportStatusValues)[number]);
  }

  if (search) {
    const escaped = search.replace(/[%_]/g, (match) => `\\${match}`);
    query = query.or(
      `reporter_discord_username.ilike.%${escaped}%,reported_discord_username.ilike.%${escaped}%,reference_code.ilike.%${escaped}%`
    );
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Failed to list reports:", error.message);
    return NextResponse.json({ error: "Failed to load reports." }, { status: 500 });
  }

  return NextResponse.json({
    reports: await attachClaimerNames(data ?? []),
    page,
    pageSize,
    total: count ?? 0,
  });
}
