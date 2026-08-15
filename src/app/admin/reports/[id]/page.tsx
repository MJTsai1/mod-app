import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireStaffSession } from "@/lib/staffAuth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { siteConfig } from "@/lib/config";
import { reportCategoryLabels } from "@/lib/config";
import { ReportStatusBadge } from "@/components/admin/StatusBadge";
import { ReportReviewPanel } from "./ReportReviewPanel";

export const metadata: Metadata = {
  title: `Report — ${siteConfig.serverName} Staff Dashboard`,
  robots: { index: false },
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-[var(--color-text)]">{value}</dd>
    </div>
  );
}

export default async function ReportDetailPage(props: PageProps<"/admin/reports/[id]">) {
  await requireStaffSession();
  const { id } = await props.params;

  if (!UUID_RE.test(id)) notFound();

  const supabase = createSupabaseAdminClient();
  const { data: report } = await supabase.from("reports").select("*").eq("id", id).maybeSingle();

  if (!report) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Report against {report.reported_discord_username}
          </h1>
          <p className="font-mono text-sm text-[var(--color-text-subtle)]">{report.reference_code}</p>
        </div>
        <ReportStatusBadge status={report.status} />
      </div>

      <div className="card mb-6 grid grid-cols-2 gap-6 p-6 sm:grid-cols-3">
        <DetailRow label="Reported by" value={report.reporter_discord_username} />
        <DetailRow label="Reported member" value={report.reported_discord_username} />
        <DetailRow label="Reported Discord ID" value={report.reported_discord_user_id ?? "—"} />
        <DetailRow label="Category" value={reportCategoryLabels[report.category]} />
        <DetailRow label="Submitted" value={new Date(report.created_at).toLocaleString()} />
      </div>

      <div className="card mb-6 p-6">
        <h2 className="mb-2 text-lg font-semibold text-[var(--color-text)]">Description</h2>
        <p className="whitespace-pre-wrap text-sm text-[var(--color-text-muted)]">{report.description}</p>
      </div>

      <div className="card mb-6 p-6">
        <h2 className="mb-2 text-lg font-semibold text-[var(--color-text)]">Evidence</h2>
        <p className="whitespace-pre-wrap text-sm text-[var(--color-text-muted)]">
          {report.evidence_links?.trim() || "None provided."}
        </p>
      </div>

      <ReportReviewPanel
        reportId={report.id}
        initialStatus={report.status}
        initialNotes={report.staff_notes ?? ""}
      />
    </div>
  );
}
