import type { Metadata } from "next";
import { requireStaffSession } from "@/lib/staffAuth";
import { getStatusCounts, getStaffBreakdown } from "@/lib/stats";
import { applicationStatusValues } from "@/lib/validation/application";
import { reportStatusValues } from "@/lib/validation/report";
import { appealStatusValues } from "@/lib/validation/appeal";
import { siteConfig } from "@/lib/config";
import { StatBreakdown } from "@/components/admin/StatBreakdown";

export const metadata: Metadata = {
  title: `Stats — ${siteConfig.serverName} Staff Dashboard`,
  robots: { index: false },
};

function rate(numerator: number, denominator: number): string | null {
  if (denominator === 0) return null;
  return `${Math.round((numerator / denominator) * 100)}%`;
}

export default async function StatsPage() {
  await requireStaffSession();

  const [applications, reports, appeals, staffBreakdown] = await Promise.all([
    getStatusCounts("applications", applicationStatusValues),
    getStatusCounts("reports", reportStatusValues),
    getStatusCounts("ban_appeals", appealStatusValues),
    getStaffBreakdown(),
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

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-[var(--color-text)]">Stats</h1>
      <p className="field-hint mb-6">
        A quick look at volume and outcomes across applications, reports, and ban appeals.
      </p>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <StatBreakdown title="Applications" counts={applications} />
        <StatBreakdown title="Reports" counts={reports} />
        <StatBreakdown title="Ban Appeals" counts={appeals} />
      </div>

      <div className="card mt-6 grid grid-cols-1 gap-6 p-6 sm:grid-cols-3">
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
      </div>

      <div className="card mt-6 p-6">
        <h2 className="mb-1 text-lg font-semibold text-[var(--color-text)]">Resolved by staff member</h2>
        <p className="field-hint mb-4">
          Applications, reports, and ban appeals each staff member has decided (accepted/rejected,
          resolved/dismissed, approved/denied).
        </p>
        {staffBreakdown.length === 0 ? (
          <p className="text-sm text-[var(--color-text-subtle)]">No decided items yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-[var(--color-text-subtle)]">
                <tr className="border-b border-[var(--color-border)]">
                  <th className="py-2 pr-4 font-medium">Staff member</th>
                  <th className="py-2 pr-4 font-medium">Applications</th>
                  <th className="py-2 pr-4 font-medium">Reports</th>
                  <th className="py-2 pr-4 font-medium">Appeals</th>
                  <th className="py-2 pr-4 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {staffBreakdown.map((row) => (
                  <tr key={row.staffId} className="border-b border-[var(--color-border)] last:border-0">
                    <td className="py-2.5 pr-4 font-medium text-[var(--color-text)]">{row.name}</td>
                    <td className="py-2.5 pr-4 text-[var(--color-text-muted)]">{row.applications}</td>
                    <td className="py-2.5 pr-4 text-[var(--color-text-muted)]">{row.reports}</td>
                    <td className="py-2.5 pr-4 text-[var(--color-text-muted)]">{row.appeals}</td>
                    <td className="py-2.5 pr-4 font-semibold text-[var(--color-text)]">{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
