import "server-only";
import type { ApplicationRow, ReportRow, BanAppealRow } from "@/lib/supabase/types";
import { reportCategoryLabels } from "@/lib/config";

/**
 * Server-side Discord integration. Disabled until DISCORD_WEBHOOK_URL is set
 * (see .env.example) — until then this is a safe no-op. The webhook URL is
 * only ever read from an environment variable on the server and is never
 * sent to the browser.
 *
 * To add bot-based integration instead of/in addition to a webhook (e.g. to
 * post richer messages or DM applicants), add DISCORD_BOT_TOKEN to your env
 * and extend this module — keep all Discord calls in this file so
 * credentials stay isolated from the rest of the app.
 */

async function postEmbed(embed: Record<string, unknown>, label: string): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    });

    if (!response.ok) {
      console.error(
        `Discord webhook responded with an error (${label}):`,
        response.status,
        await response.text()
      );
    }
  } catch (error) {
    // Never let a Discord failure affect the submitter's result.
    console.error(`Failed to notify Discord (${label}):`, error);
  }
}

export async function notifyDiscordOfNewApplication(
  application: ApplicationRow
): Promise<void> {
  const dashboardBaseUrl = process.env.NEXT_PUBLIC_SITE_URL;

  await postEmbed(
    {
      title: "New Moderator Application",
      color: 0x8b5cf6,
      fields: [
        { name: "Applicant", value: application.discord_username, inline: true },
        { name: "Discord ID", value: application.discord_user_id, inline: true },
        { name: "Reference", value: application.reference_code, inline: true },
      ],
      timestamp: application.created_at,
      ...(dashboardBaseUrl
        ? {
            description: `[Open in staff dashboard](${dashboardBaseUrl}/admin/dashboard/${application.id})`,
          }
        : {}),
    },
    "application"
  );
}

export async function notifyDiscordOfNewReport(report: ReportRow): Promise<void> {
  const dashboardBaseUrl = process.env.NEXT_PUBLIC_SITE_URL;

  await postEmbed(
    {
      title: "New Member Report",
      color: 0xef4444,
      fields: [
        { name: "Reported member", value: report.reported_discord_username, inline: true },
        { name: "Category", value: reportCategoryLabels[report.category], inline: true },
        { name: "Reference", value: report.reference_code, inline: true },
      ],
      timestamp: report.created_at,
      ...(dashboardBaseUrl
        ? {
            description: `[Open in staff dashboard](${dashboardBaseUrl}/admin/reports/${report.id})`,
          }
        : {}),
    },
    "report"
  );
}

export async function notifyDiscordOfNewAppeal(appeal: BanAppealRow): Promise<void> {
  const dashboardBaseUrl = process.env.NEXT_PUBLIC_SITE_URL;

  await postEmbed(
    {
      title: "New Ban Appeal",
      color: 0xf59e0b,
      fields: [
        { name: "Applicant", value: appeal.discord_username, inline: true },
        { name: "Discord ID", value: appeal.discord_user_id, inline: true },
        { name: "Reference", value: appeal.reference_code, inline: true },
      ],
      timestamp: appeal.created_at,
      ...(dashboardBaseUrl
        ? {
            description: `[Open in staff dashboard](${dashboardBaseUrl}/admin/appeals/${appeal.id})`,
          }
        : {}),
    },
    "appeal"
  );
}
