import type { StatusCounts } from "@/lib/stats";
import { formatStatusLabel } from "@/lib/formatStatus";

const BAR_COLOR = "var(--color-accent)";

export function StatBreakdown({ title, counts }: { title: string; counts: StatusCounts }) {
  return (
    <div className="card p-6">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold text-[var(--color-text)]">{title}</h2>
        <span className="text-sm text-[var(--color-text-subtle)]">{counts.total} total</span>
      </div>

      {counts.total === 0 ? (
        <p className="text-sm text-[var(--color-text-subtle)]">No submissions yet.</p>
      ) : (
        <div className="space-y-3">
          {Object.entries(counts.byStatus).map(([status, count]) => {
            const percent = counts.total > 0 ? Math.round((count / counts.total) * 100) : 0;
            return (
              <div key={status}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-[var(--color-text-muted)]">{formatStatusLabel(status)}</span>
                  <span className="text-[var(--color-text-subtle)]">
                    {count} ({percent}%)
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[var(--color-surface-hover)]">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${percent}%`, background: BAR_COLOR }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
