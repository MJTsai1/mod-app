import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { notifyDiscordOfStaleItem } from "@/lib/discord";
import { logActivity } from "@/lib/activityLog";
import { siteConfig } from "@/lib/config";
import type { ActivityEntityType } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const NUDGE_DETAIL_PREFIX = "Automatic reminder sent";

interface StaleTableConfig {
  table: "applications" | "reports" | "ban_appeals" | "support_requests";
  entityType: ActivityEntityType;
  openStatus: string;
  identifierColumn: string;
  titleFor: (row: Record<string, unknown>) => string;
  dashboardPath: (id: string) => string;
}

const TABLES: StaleTableConfig[] = [
  {
    table: "applications",
    entityType: "application",
    openStatus: "pending",
    identifierColumn: "discord_username",
    titleFor: () => "Moderator Application",
    dashboardPath: (id) => `/admin/dashboard/${id}`,
  },
  {
    table: "reports",
    entityType: "report",
    openStatus: "pending",
    identifierColumn: "reported_discord_username",
    titleFor: () => "Member Report",
    dashboardPath: (id) => `/admin/reports/${id}`,
  },
  {
    table: "ban_appeals",
    entityType: "appeal",
    openStatus: "pending",
    identifierColumn: "discord_username",
    titleFor: () => "Ban Appeal",
    dashboardPath: (id) => `/admin/appeals/${id}`,
  },
  {
    table: "support_requests",
    entityType: "support",
    openStatus: "open",
    identifierColumn: "discord_username",
    titleFor: (row) => `Support Request: ${row.subject as string}`,
    dashboardPath: (id) => `/admin/support/${id}`,
  },
];

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("Nudge cron ran without CRON_SECRET configured — refusing to run.");
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  }
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();
  const cutoff = new Date(Date.now() - siteConfig.nudgeThresholdHours * 60 * 60 * 1000).toISOString();

  let nudged = 0;
  let checked = 0;

  for (const config of TABLES) {
    const { data: staleRows, error } = await supabase
      .from(config.table)
      .select("*")
      // Cast needed: this loop spans four tables with different status
      // enum types, which TS can't narrow generically across the union.
      .eq("status", config.openStatus as never)
      .is("claimed_by", null)
      .lte("created_at", cutoff);

    if (error) {
      console.error(`Nudge cron: failed to query ${config.table}:`, error.message);
      continue;
    }

    for (const rawRow of staleRows ?? []) {
      checked++;
      const row = rawRow as unknown as Record<string, unknown>;
      const id = row.id as string;
      const createdAt = row.created_at as string;

      // Skip if we've already nudged this one (idempotent regardless of
      // cron frequency or missed runs).
      const { data: existingNudge } = await supabase
        .from("activity_log")
        .select("id")
        .eq("entity_type", config.entityType)
        .eq("entity_id", id)
        .eq("actor_type", "system")
        .like("detail", `${NUDGE_DETAIL_PREFIX}%`)
        .maybeSingle();

      if (existingNudge) continue;

      const ageHours = (Date.now() - new Date(createdAt).getTime()) / 3_600_000;

      notifyDiscordOfStaleItem({
        entityType: config.entityType,
        entityId: id,
        title: config.titleFor(row),
        identifier: (row[config.identifierColumn] as string) ?? "Unknown",
        referenceCode: row.reference_code as string,
        ageHours,
        dashboardPath: config.dashboardPath(id),
      }).catch(() => {});

      await logActivity({
        entityType: config.entityType,
        entityId: id,
        actorType: "system",
        detail: `${NUDGE_DETAIL_PREFIX} (unclaimed for ${Math.round(ageHours)}h)`,
      });

      nudged++;
    }
  }

  return NextResponse.json({ checked, nudged });
}
