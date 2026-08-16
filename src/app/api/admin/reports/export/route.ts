import { NextResponse } from "next/server";
import { getStaffSession } from "@/lib/staffAuth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { reportStatusValues } from "@/lib/validation/report";
import { reportCategoryLabels } from "@/lib/config";
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
    .from("reports")
    .select(
      "reference_code, status, created_at, reporter_discord_username, reported_discord_username, reported_discord_user_id, category"
    )
    .order("created_at", { ascending: false });

  if (status && (reportStatusValues as readonly string[]).includes(status)) {
    query = query.eq("status", status as (typeof reportStatusValues)[number]);
  }
  if (search) {
    const escaped = search.replace(/[%_]/g, (match) => `\\${match}`);
    query = query.or(
      `reporter_discord_username.ilike.%${escaped}%,reported_discord_username.ilike.%${escaped}%,reference_code.ilike.%${escaped}%`
    );
  }

  const { data, error } = await query;
  if (error) {
    console.error("Failed to export reports:", error.message);
    return NextResponse.json({ error: "Failed to export reports." }, { status: 500 });
  }

  const csv = toCsv(
    ["Reference", "Status", "Submitted", "Reporter", "Reported Member", "Reported Discord ID", "Category"],
    (data ?? []).map((row) => [
      row.reference_code,
      row.status,
      row.created_at,
      row.reporter_discord_username,
      row.reported_discord_username,
      row.reported_discord_user_id,
      reportCategoryLabels[row.category],
    ])
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="reports-${Date.now()}.csv"`,
    },
  });
}
