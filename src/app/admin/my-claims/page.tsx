import Link from "next/link";
import type { Metadata } from "next";
import { requireStaffSession } from "@/lib/staffAuth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { siteConfig } from "@/lib/config";
import { StatusBadge, ReportStatusBadge, AppealStatusBadge } from "@/components/admin/StatusBadge";

export const metadata: Metadata = {
  title: `My Claims — ${siteConfig.serverName} Staff Dashboard`,
  robots: { index: false },
};

export default async function MyClaimsPage() {
  const session = await requireStaffSession();
  const supabase = createSupabaseAdminClient();

  const [{ data: applications }, { data: reports }, { data: appeals }] = await Promise.all([
    supabase
      .from("applications")
      .select("id, reference_code, discord_username, status, claimed_at")
      .eq("claimed_by", session.staff.id)
      .order("claimed_at", { ascending: false }),
    supabase
      .from("reports")
      .select("id, reference_code, reported_discord_username, status, claimed_at")
      .eq("claimed_by", session.staff.id)
      .order("claimed_at", { ascending: false }),
    supabase
      .from("ban_appeals")
      .select("id, reference_code, discord_username, status, claimed_at")
      .eq("claimed_by", session.staff.id)
      .order("claimed_at", { ascending: false }),
  ]);

  const hasAny =
    (applications && applications.length > 0) ||
    (reports && reports.length > 0) ||
    (appeals && appeals.length > 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-[var(--color-text)]">My Claims</h1>
      <p className="field-hint mb-6">Applications, reports, and ban appeals you&apos;ve claimed.</p>

      {!hasAny && (
        <div className="card p-6 text-sm text-[var(--color-text-subtle)]">
          You haven&apos;t claimed anything yet.
        </div>
      )}

      {applications && applications.length > 0 && (
        <div className="card mb-6 overflow-hidden">
          <h2 className="border-b border-[var(--color-border)] px-4 py-3 text-sm font-semibold text-[var(--color-text)] sm:px-6">
            Applications
          </h2>
          <ul className="divide-y divide-[var(--color-border)]">
            {applications.map((application) => (
              <li key={application.id} className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
                <Link
                  href={`/admin/dashboard/${application.id}`}
                  className="text-sm font-medium text-[var(--color-accent-soft)] hover:underline"
                >
                  {application.discord_username}
                </Link>
                <StatusBadge status={application.status} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {reports && reports.length > 0 && (
        <div className="card mb-6 overflow-hidden">
          <h2 className="border-b border-[var(--color-border)] px-4 py-3 text-sm font-semibold text-[var(--color-text)] sm:px-6">
            Reports
          </h2>
          <ul className="divide-y divide-[var(--color-border)]">
            {reports.map((report) => (
              <li key={report.id} className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
                <Link
                  href={`/admin/reports/${report.id}`}
                  className="text-sm font-medium text-[var(--color-accent-soft)] hover:underline"
                >
                  {report.reported_discord_username}
                </Link>
                <ReportStatusBadge status={report.status} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {appeals && appeals.length > 0 && (
        <div className="card overflow-hidden">
          <h2 className="border-b border-[var(--color-border)] px-4 py-3 text-sm font-semibold text-[var(--color-text)] sm:px-6">
            Ban Appeals
          </h2>
          <ul className="divide-y divide-[var(--color-border)]">
            {appeals.map((appeal) => (
              <li key={appeal.id} className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
                <Link
                  href={`/admin/appeals/${appeal.id}`}
                  className="text-sm font-medium text-[var(--color-accent-soft)] hover:underline"
                >
                  {appeal.discord_username}
                </Link>
                <AppealStatusBadge status={appeal.status} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
