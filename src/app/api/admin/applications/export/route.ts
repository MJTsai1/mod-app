import { NextResponse } from "next/server";
import { getStaffSession } from "@/lib/staffAuth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { applicationStatusValues } from "@/lib/validation/application";
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
    .from("applications")
    .select(
      "reference_code, status, created_at, discord_username, discord_user_id, age, country, timezone, time_in_server, activity_level, online_times, weekly_hours, has_moderated_before"
    )
    .order("created_at", { ascending: false });

  if (status && (applicationStatusValues as readonly string[]).includes(status)) {
    query = query.eq("status", status as (typeof applicationStatusValues)[number]);
  }
  if (search) {
    const escaped = search.replace(/[%_]/g, (match) => `\\${match}`);
    query = query.or(
      `discord_username.ilike.%${escaped}%,discord_user_id.ilike.%${escaped}%,reference_code.ilike.%${escaped}%`
    );
  }

  const { data, error } = await query;
  if (error) {
    console.error("Failed to export applications:", error.message);
    return NextResponse.json({ error: "Failed to export applications." }, { status: 500 });
  }

  const csv = toCsv(
    [
      "Reference",
      "Status",
      "Submitted",
      "Discord Username",
      "Discord User ID",
      "Age",
      "Country",
      "Timezone",
      "Time In Server",
      "Activity Level",
      "Online Times",
      "Weekly Hours",
      "Moderated Before",
    ],
    (data ?? []).map((row) => [
      row.reference_code,
      row.status,
      row.created_at,
      row.discord_username,
      row.discord_user_id,
      row.age,
      row.country,
      row.timezone,
      row.time_in_server,
      row.activity_level,
      row.online_times,
      row.weekly_hours,
      row.has_moderated_before ? "Yes" : "No",
    ])
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="applications-${Date.now()}.csv"`,
    },
  });
}
