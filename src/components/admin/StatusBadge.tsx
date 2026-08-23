import type { ApplicationStatus, ReportStatus, AppealStatus } from "@/lib/supabase/types";

const STATUS_STYLES: Record<ApplicationStatus, { bg: string; color: string }> = {
  pending: { bg: "var(--color-info-bg)", color: "var(--color-info)" },
  reviewing: { bg: "var(--color-warning-bg)", color: "var(--color-warning)" },
  needs_info: { bg: "rgba(139,92,246,0.15)", color: "var(--color-accent)" },
  accepted: { bg: "var(--color-success-bg)", color: "var(--color-success)" },
  rejected: { bg: "var(--color-danger-bg)", color: "var(--color-danger)" },
  withdrawn: { bg: "rgba(138,128,171,0.15)", color: "var(--color-text-subtle)" },
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span className="badge" style={{ background: style.bg, color: style.color }}>
      {status}
    </span>
  );
}

const REPORT_STATUS_STYLES: Record<ReportStatus, { bg: string; color: string }> = {
  pending: { bg: "var(--color-info-bg)", color: "var(--color-info)" },
  reviewing: { bg: "var(--color-warning-bg)", color: "var(--color-warning)" },
  resolved: { bg: "var(--color-success-bg)", color: "var(--color-success)" },
  dismissed: { bg: "rgba(138,128,171,0.15)", color: "var(--color-text-subtle)" },
  withdrawn: { bg: "rgba(138,128,171,0.15)", color: "var(--color-text-subtle)" },
};

export function ReportStatusBadge({ status }: { status: ReportStatus }) {
  const style = REPORT_STATUS_STYLES[status];
  return (
    <span className="badge" style={{ background: style.bg, color: style.color }}>
      {status}
    </span>
  );
}

const APPEAL_STATUS_STYLES: Record<AppealStatus, { bg: string; color: string }> = {
  pending: { bg: "var(--color-info-bg)", color: "var(--color-info)" },
  reviewing: { bg: "var(--color-warning-bg)", color: "var(--color-warning)" },
  approved: { bg: "var(--color-success-bg)", color: "var(--color-success)" },
  denied: { bg: "var(--color-danger-bg)", color: "var(--color-danger)" },
  withdrawn: { bg: "rgba(138,128,171,0.15)", color: "var(--color-text-subtle)" },
};

export function AppealStatusBadge({ status }: { status: AppealStatus }) {
  const style = APPEAL_STATUS_STYLES[status];
  return (
    <span className="badge" style={{ background: style.bg, color: style.color }}>
      {status}
    </span>
  );
}
