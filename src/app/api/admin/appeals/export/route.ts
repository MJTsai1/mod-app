import { NextResponse } from "next/server";
import { getStaffSession } from "@/lib/staffAuth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { appealStatusValues } from "@/lib/validation/appeal";
import { toCsv } from "@/lib/csv";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const search = url.searchParams.get("q")?.trim();

  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("ban_appeals")
    .select("reference_code, status, created_at, discord_username, discord_user_id")
    .order("created_at", { ascending: false });

  if (status && (appealStatusValues as readonly string[]).includes(status)) {
    query = query.eq("status", status as (typeof appealStatusValues)[number]);
  }
  if (search) {
    const escaped = search.replace(/[%_]/g, (match) => `\\${match}`);
    query = query.or(
      `discord_username.ilike.%${escaped}%,discord_user_id.ilike.%${escaped}%,reference_code.ilike.%${escaped}%`
    );
  }

  const { data, error } = await query;
  if (error) {
    console.error("Failed to export ban appeals:", error.message);
    return NextResponse.json({ error: "Failed to export ban appeals." }, { status: 500 });
  }

  const csv = toCsv(
    ["Reference", "Status", "Submitted", "Discord Username", "Discord User ID"],
    (data ?? []).map((row) => [row.reference_code, row.status, row.created_at, row.discord_username, row.discord_user_id])
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ban-appeals-${Date.now()}.csv"`,
    },
  });
}
