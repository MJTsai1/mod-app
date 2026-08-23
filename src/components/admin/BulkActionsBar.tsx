"use client";

import { useState } from "react";
import { formatStatusLabel } from "@/lib/formatStatus";

interface Props<T extends string> {
  count: number;
  statusValues: readonly T[];
  onApply: (status: T) => void | Promise<void>;
  onClear: () => void;
  applying: boolean;
}

export function BulkActionsBar<T extends string>({
  count,
  statusValues,
  onApply,
  onClear,
  applying,
}: Props<T>) {
  const [status, setStatus] = useState<T>(statusValues[0]);

  if (count === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] px-4 py-3">
      <span className="text-sm font-medium text-[var(--color-text)]">{count} selected</span>
      <select
        value={status}
        onChange={(event) => setStatus(event.target.value as T)}
        className="field-input w-auto py-1.5 text-sm"
        aria-label="Bulk status to apply"
      >
        {statusValues.map((s) => (
          <option key={s} value={s}>
            Set status: {formatStatusLabel(s)}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => onApply(status)}
        disabled={applying}
        className="btn btn-primary px-3 py-1.5 text-sm"
      >
        {applying ? "Applying…" : "Apply"}
      </button>
      <button type="button" onClick={onClear} className="btn btn-ghost px-3 py-1.5 text-sm">
        Clear selection
      </button>
    </div>
  );
}
