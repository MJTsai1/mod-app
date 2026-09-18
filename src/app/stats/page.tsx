import Link from "next/link";
import type { Metadata } from "next";
import { getStatusCounts, getAverageResolutionHours } from "@/lib/stats";
import { applicationStatusValues } from "@/lib/validation/application";
import { reportStatusValues } from "@/lib/validation/report";
import { appealStatusValues } from "@/lib/validation/appeal";
import { siteConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Community Stats — ${siteConfig.serverName}`,
  description: `A public look at moderation activity on ${siteConfig.serverName}.`,
};

function rate(numerator: number, denominator: number): string | null {
  if (denominator === 0) return null;
  return `${Math.round((numerator / denominator) * 100)}%`;
}

function formatHours(hours: number | null): string {
  if (hours === null) return "—";
  if (hours < 1) return "< 1 hour";
  if (hours < 48) return `${Math.round(hours)} hours`;
  return `${Math.round(hours / 24)} days`;
}

export default async function PublicStatsPage() {
  const [applications, reports, appeals, avgResolutionHours] = await Promise.all([
    getStatusCounts("applications", applicationStatusValues),
    getStatusCounts("reports", reportStatusValues),
    getStatusCounts("ban_appeals", appealStatusValues),
    getAverageResolutionHours(),
  ]);

  const acceptanceRate = rate(
    applications.byStatus.accepted,
    applications.byStatus.accepted + applications.byStatus.rejected
  );
  const resolutionRate = rate(
    reports.byStatus.resolved,
    reports.byStatus.resolved + reports.byStatus.dismissed
  );
  const approvalRate = rate(
    appeals.byStatus.approved,
    appeals.byStatus.approved + appeals.byStatus.denied
  );

  const cards = [
    { label: "Applications received", value: applications.total },
    { label: "Applications accepted", value: applications.byStatus.accepted },
    { label: "Reports filed", value: reports.total },
    { label: "Reports resolved", value: reports.byStatus.resolved },
    { label: "Ban appeals reviewed", value: appeals.total },
    { label: "Ban appeals approved", value: appeals.byStatus.approved },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Community <span className="gradient-text">Stats</span>
        </h1>
        <p className="mt-3 text-[var(--color-text-muted)]">
          A public look at how {siteConfig.serverName}&apos;s staff team is doing — no personal
          information, just totals.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="card p-5 text-center">
            <p className="text-2xl font-bold text-[var(--color-text)] sm:text-3xl">{card.value}</p>
            <p className="mt-1 text-xs text-[var(--color-text-subtle)]">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="card mt-6 grid grid-cols-1 gap-6 p-6 sm:grid-cols-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--color-text-subtle)]">
            Acceptance rate
          </p>
          <p className="mt-1 text-2xl font-bold text-[var(--color-text)]">{acceptanceRate ?? "—"}</p>
          <p className="text-xs text-[var(--color-text-subtle)]">of decided applications</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--color-text-subtle)]">
            Resolution rate
          </p>
          <p className="mt-1 text-2xl font-bold text-[var(--color-text)]">{resolutionRate ?? "—"}</p>
          <p className="text-xs text-[var(--color-text-subtle)]">of decided reports</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--color-text-subtle)]">
            Approval rate
          </p>
          <p className="mt-1 text-2xl font-bold text-[var(--color-text)]">{approvalRate ?? "—"}</p>
          <p className="text-xs text-[var(--color-text-subtle)]">of decided ban appeals</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--color-text-subtle)]">
            Avg. response time
          </p>
          <p className="mt-1 text-2xl font-bold text-[var(--color-text)]">
            {formatHours(avgResolutionHours)}
          </p>
          <p className="text-xs text-[var(--color-text-subtle)]">from submission to decision</p>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-[var(--color-text-subtle)]">
        <Link href="/" className="font-medium text-[var(--color-accent-soft)] hover:underline">
          ← Back home
        </Link>
      </p>
    </div>
  );
}
