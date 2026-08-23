"use client";

import { useState } from "react";
import { useToast } from "@/components/site/ToastProvider";
import { formatStatusLabel } from "@/lib/formatStatus";

interface Props<T extends string> {
  status: T;
  statusValues: readonly T[];
  endpoint: string;
  onUpdated: (newStatus: T) => void;
}

export function InlineStatusSelect<T extends string>({
  status,
  statusValues,
  endpoint,
  onUpdated,
}: Props<T>) {
  const { showToast } = useToast();
  const [value, setValue] = useState(status);
  const [saving, setSaving] = useState(false);

  async function handleChange(newStatus: T) {
    const previous = value;
    setValue(newStatus);
    setSaving(true);

    try {
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setValue(previous);
        showToast(body?.error ?? "Failed to update status.", "error");
        return;
      }

      onUpdated(newStatus);
      showToast("Status updated.");
    } catch {
      setValue(previous);
      showToast("Network error — please try again.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <select
      value={value}
      disabled={saving}
      onClick={(event) => event.stopPropagation()}
      onChange={(event) => handleChange(event.target.value as T)}
      className="field-input w-auto px-2 py-1 text-xs"
      aria-label="Change status"
    >
      {statusValues.map((s) => (
        <option key={s} value={s}>
          {formatStatusLabel(s)}
        </option>
      ))}
    </select>
  );
}
