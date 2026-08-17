import { NextResponse } from "next/server";
import { getStaffSession } from "@/lib/staffAuth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { applicationStatusValues } from "@/lib/validation/application";
import { attachClaimerNames } from "@/lib/attachClaimerNames";
import { parseSortParams } from "@/lib/sortParams";

export const dynamic = "force-dynamic";

const PAGE_SIZE_DEFAULT = 20;
const PAGE_SIZE_MAX = 100;
const SORTABLE_COLUMNS = ["created_at", "status", "discord_username", "age"] as const;

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

  const { column: sortColumn, ascending: sortAscending } = parseSortParams(
    url,
    SORTABLE_COLUMNS,
    "created_at"
  );

  const supabase = createSupabaseAdminClient();

  let query = supabase
    .from("applications")
    .select(
      "id, reference_code, created_at, updated_at, discord_username, discord_user_id, status, age, country, claimed_by",
      { count: "exact" }
    )
    .order(sortColumn, { ascending: sortAscending })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (status && (applicationStatusValues as readonly string[]).includes(status)) {
    query = query.eq("status", status as (typeof applicationStatusValues)[number]);
  }

  if (search) {
    const escaped = search.replace(/[%_]/g, (match) => `\\${match}`);
    query = query.or(
      `discord_username.ilike.%${escaped}%,discord_user_id.ilike.%${escaped}%,reference_code.ilike.%${escaped}%`
    );
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Failed to list applications:", error.message);
    return NextResponse.json(
      { error: "Failed to load applications." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    applications: await attachClaimerNames(data ?? []),
    page,
    pageSize,
    total: count ?? 0,
  });
}
