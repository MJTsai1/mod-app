import { NextResponse } from "next/server";
import { getStaffSession } from "@/lib/staffAuth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { appealStatusValues } from "@/lib/validation/appeal";

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
    .from("ban_appeals")
    .select("id, reference_code, created_at, discord_username, discord_user_id, status", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (status && (appealStatusValues as readonly string[]).includes(status)) {
    query = query.eq("status", status as (typeof appealStatusValues)[number]);
  }

  if (search) {
    const escaped = search.replace(/[%_]/g, (match) => `\\${match}`);
    query = query.or(
      `discord_username.ilike.%${escaped}%,discord_user_id.ilike.%${escaped}%,reference_code.ilike.%${escaped}%`
    );
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Failed to list ban appeals:", error.message);
    return NextResponse.json({ error: "Failed to load ban appeals." }, { status: 500 });
  }

  return NextResponse.json({ appeals: data, page, pageSize, total: count ?? 0 });
}
