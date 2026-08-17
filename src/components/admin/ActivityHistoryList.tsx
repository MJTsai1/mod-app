import type { ActivityHistoryEntry } from "@/lib/activityLog";

export function ActivityHistoryList({ entries }: { entries: ActivityHistoryEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-[var(--color-text-subtle)]">No activity recorded yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {entries.map((entry) => (
        <li key={entry.id} className="flex items-start justify-between gap-4 text-sm">
          <div>
            <p className="text-[var(--color-text)]">{entry.detail}</p>
            <p className="text-xs text-[var(--color-text-subtle)]">{entry.actorName}</p>
          </div>
          <time className="shrink-0 whitespace-nowrap text-xs text-[var(--color-text-subtle)]">
            {new Date(entry.createdAt).toLocaleString()}
          </time>
        </li>
      ))}
    </ul>
  );
}
