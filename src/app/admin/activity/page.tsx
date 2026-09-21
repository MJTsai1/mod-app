import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { requireStaffSession } from "@/lib/staffAuth";
import { getRecentActivity, activityEntityHref } from "@/lib/activityLog";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: `Activity — ${siteConfig.serverName} Staff Dashboard`,
  robots: { index: false },
};

export default async function ActivityPage() {
  await requireStaffSession();
  const entries = await getRecentActivity(75);
  const t = await getTranslations("activityPage");
  const tTable = await getTranslations("table");
  const tActivityList = await getTranslations("activityList");

  const ENTITY_LABELS = {
    application: t("entityApplication"),
    report: t("entityReport"),
    appeal: t("entityAppeal"),
    support: t("entitySupport"),
  } as const;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">{t("title")}</h1>
          <p className="field-hint">{t("subtitle")}</p>
        </div>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- a file download, not a page navigation */}
        <a href="/api/admin/activity/export" className="btn btn-secondary px-3 py-2 text-sm">
          {tTable("exportCsv")}
        </a>
      </div>

      <div className="card overflow-hidden">
        {entries.length === 0 ? (
          <p className="p-6 text-sm text-[var(--color-text-subtle)]">{tActivityList("noActivity")}</p>
        ) : (
          <ul className="divide-y divide-[var(--color-border)]">
            {entries.map((entry) => (
              <li key={entry.id} className="flex items-start justify-between gap-4 px-4 py-3 sm:px-6">
                <div>
                  <p className="text-sm text-[var(--color-text)]">
                    <Link
                      href={activityEntityHref(entry)}
                      className="font-medium text-[var(--color-accent-soft)] hover:underline"
                    >
                      {ENTITY_LABELS[entry.entityType]}
                    </Link>{" "}
                    — {entry.detail}
                  </p>
                  <p className="text-xs text-[var(--color-text-subtle)]">{entry.actorName}</p>
                </div>
                <time className="shrink-0 whitespace-nowrap text-xs text-[var(--color-text-subtle)]">
                  {new Date(entry.createdAt).toLocaleString()}
                </time>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
