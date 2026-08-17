"use client";

interface Props {
  label: string;
  column: string;
  currentSort: string;
  currentOrder: "asc" | "desc";
  onSort: (column: string) => void;
}

export function SortableHeader({ label, column, currentSort, currentOrder, onSort }: Props) {
  const active = currentSort === column;
  return (
    <th className="px-4 py-3">
      <button
        type="button"
        onClick={() => onSort(column)}
        className="flex items-center gap-1 uppercase tracking-wide text-[var(--color-text-subtle)] transition hover:text-[var(--color-text)]"
      >
        {label}
        {active && <span aria-hidden>{currentOrder === "asc" ? "↑" : "↓"}</span>}
      </button>
    </th>
  );
}
