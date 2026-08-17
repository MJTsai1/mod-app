import Link from "next/link";
import type { Metadata } from "next";
import { requireStaffSession } from "@/lib/staffAuth";
import { getRecentActivity, activityEntityHref } from "@/lib/activityLog";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: `Activity — ${siteConfig.serverName} Staff Dashboard`,
  robots: { index: false },
};

const ENTITY_LABELS = {
  application: "Application",
  report: "Report",
  appeal: "Ban Appeal",
} as const;

export default async function ActivityPage() {
  await requireStaffSession();
  const entries = await getRecentActivity(75);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-[var(--color-text)]">Activity</h1>
      <p className="field-hint mb-6">
        Recent status changes, claims, and self-service withdrawals across applications, reports,
        and ban appeals.
      </p>

      <div className="card overflow-hidden">
        {entries.length === 0 ? (
          <p className="p-6 text-sm text-[var(--color-text-subtle)]">No activity recorded yet.</p>
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
