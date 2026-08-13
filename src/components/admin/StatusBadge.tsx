import type { ApplicationStatus } from "@/lib/supabase/types";

const STATUS_STYLES: Record<ApplicationStatus, { bg: string; color: string }> = {
  pending: { bg: "var(--color-info-bg)", color: "var(--color-info)" },
  reviewing: { bg: "var(--color-warning-bg)", color: "var(--color-warning)" },
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
