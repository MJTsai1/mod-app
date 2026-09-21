"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("bulk");
  const tStatus = useTranslations("status");
  const [status, setStatus] = useState<T>(statusValues[0]);

  if (count === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] px-4 py-3">
      <span className="text-sm font-medium text-[var(--color-text)]">{t("selected", { count })}</span>
      <select
        value={status}
        onChange={(event) => setStatus(event.target.value as T)}
        className="field-input w-auto py-1.5 text-sm"
        aria-label={t("bulkStatusAria")}
      >
        {statusValues.map((s) => (
          <option key={s} value={s}>
            {t("setStatus", { label: tStatus(s as never) })}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => onApply(status)}
        disabled={applying}
        className="btn btn-primary px-3 py-1.5 text-sm"
      >
        {applying ? t("applying") : t("apply")}
      </button>
      <button type="button" onClick={onClear} className="btn btn-ghost px-3 py-1.5 text-sm">
        {t("clearSelection")}
      </button>
    </div>
  );
}
