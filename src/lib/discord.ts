import "server-only";
import type { ApplicationRow, ReportRow, BanAppealRow, SupportRequestRow } from "@/lib/supabase/types";
import { reportCategoryLabels } from "@/lib/config";
import { formatStatusLabel } from "@/lib/formatStatus";

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
      body: JSON.stringify({
        username: "Website Notification",
        content: "@everyone",
        allowed_mentions: { parse: ["everyone"] },
        embeds: [embed],
      }),
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

const STATUS_COLORS: Record<string, number> = {
  pending: 0x60a5fa,
  reviewing: 0xfbbf24,
  needs_info: 0x8b5cf6,
  accepted: 0x34d399,
  approved: 0x34d399,
  resolved: 0x34d399,
  rejected: 0xf87171,
  denied: 0xf87171,
  dismissed: 0x8a80ab,
  withdrawn: 0x8a80ab,
};

export async function notifyDiscordOfApplicationStatusChange(
  application: ApplicationRow,
  oldStatus: string
): Promise<void> {
  const dashboardBaseUrl = process.env.NEXT_PUBLIC_SITE_URL;

  await postEmbed(
    {
      title: "Application Status Updated",
      color: STATUS_COLORS[application.status] ?? 0x8b5cf6,
      fields: [
        { name: "Applicant", value: application.discord_username, inline: true },
        {
          name: "Status",
          value: `${formatStatusLabel(oldStatus)} → ${formatStatusLabel(application.status)}`,
          inline: true,
        },
        { name: "Reference", value: application.reference_code, inline: true },
      ],
      ...(dashboardBaseUrl
        ? {
            description: `[Open in staff dashboard](${dashboardBaseUrl}/admin/dashboard/${application.id})`,
          }
        : {}),
    },
    "application status change"
  );
}

export async function notifyDiscordOfReportStatusChange(
  report: ReportRow,
  oldStatus: string
): Promise<void> {
  const dashboardBaseUrl = process.env.NEXT_PUBLIC_SITE_URL;

  await postEmbed(
    {
      title: "Report Status Updated",
      color: STATUS_COLORS[report.status] ?? 0x8b5cf6,
      fields: [
        { name: "Reported member", value: report.reported_discord_username, inline: true },
        {
          name: "Status",
          value: `${formatStatusLabel(oldStatus)} → ${formatStatusLabel(report.status)}`,
          inline: true,
        },
        { name: "Reference", value: report.reference_code, inline: true },
      ],
      ...(dashboardBaseUrl
        ? {
            description: `[Open in staff dashboard](${dashboardBaseUrl}/admin/reports/${report.id})`,
          }
        : {}),
    },
    "report status change"
  );
}

export async function notifyDiscordOfAppealStatusChange(
  appeal: BanAppealRow,
  oldStatus: string
): Promise<void> {
  const dashboardBaseUrl = process.env.NEXT_PUBLIC_SITE_URL;

  await postEmbed(
    {
      title: "Ban Appeal Status Updated",
      color: STATUS_COLORS[appeal.status] ?? 0x8b5cf6,
      fields: [
        { name: "Appellant", value: appeal.discord_username, inline: true },
        {
          name: "Status",
          value: `${formatStatusLabel(oldStatus)} → ${formatStatusLabel(appeal.status)}`,
          inline: true,
        },
        { name: "Reference", value: appeal.reference_code, inline: true },
      ],
      ...(dashboardBaseUrl
        ? {
            description: `[Open in staff dashboard](${dashboardBaseUrl}/admin/appeals/${appeal.id})`,
          }
        : {}),
    },
    "appeal status change"
  );
}

export async function notifyDiscordOfNewSupportRequest(
  supportRequest: SupportRequestRow
): Promise<void> {
  const dashboardBaseUrl = process.env.NEXT_PUBLIC_SITE_URL;

  await postEmbed(
    {
      title: "New Support Request",
      color: 0x60a5fa,
      fields: [
        { name: "From", value: supportRequest.discord_username, inline: true },
        { name: "Subject", value: supportRequest.subject, inline: true },
        { name: "Reference", value: supportRequest.reference_code, inline: true },
      ],
      timestamp: supportRequest.created_at,
      ...(dashboardBaseUrl
        ? {
            description: `[Open in staff dashboard](${dashboardBaseUrl}/admin/support/${supportRequest.id})`,
          }
        : {}),
    },
    "support request"
  );
}

export async function notifyDiscordOfSupportStatusChange(
  supportRequest: SupportRequestRow,
  oldStatus: string
): Promise<void> {
  const dashboardBaseUrl = process.env.NEXT_PUBLIC_SITE_URL;

  await postEmbed(
    {
      title: "Support Request Status Updated",
      color: STATUS_COLORS[supportRequest.status] ?? 0x8b5cf6,
      fields: [
        { name: "From", value: supportRequest.discord_username, inline: true },
        {
          name: "Status",
          value: `${formatStatusLabel(oldStatus)} → ${formatStatusLabel(supportRequest.status)}`,
          inline: true,
        },
        { name: "Reference", value: supportRequest.reference_code, inline: true },
      ],
      ...(dashboardBaseUrl
        ? {
            description: `[Open in staff dashboard](${dashboardBaseUrl}/admin/support/${supportRequest.id})`,
          }
        : {}),
    },
    "support status change"
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
