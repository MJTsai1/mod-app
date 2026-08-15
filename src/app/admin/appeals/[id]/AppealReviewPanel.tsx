"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { appealStatusValues } from "@/lib/validation/appeal";
import type { AppealStatus } from "@/lib/supabase/types";

interface Props {
  appealId: string;
  initialStatus: AppealStatus;
  initialNotes: string;
}

export function AppealReviewPanel({ appealId, initialStatus, initialNotes }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<AppealStatus>(initialStatus);
  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const dirty = status !== initialStatus || notes !== initialNotes;

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/appeals/${appealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, staffNotes: notes }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setMessage({ type: "error", text: body?.error ?? "Failed to save changes." });
        return;
      }

      setMessage({ type: "success", text: "Changes saved." });
      router.refresh();
    } catch {
      setMessage({ type: "error", text: "Network error — please try again." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card p-6">
      <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">Staff Review</h2>

      <label htmlFor="status" className="field-label">
        Appeal status
      </label>
      <select
        id="status"
        value={status}
        onChange={(event) => setStatus(event.target.value as AppealStatus)}
        className="field-input mb-4 sm:max-w-xs"
      >
        {appealStatusValues.map((s) => (
          <option key={s} value={s}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </option>
        ))}
      </select>

      <label htmlFor="notes" className="field-label">
        Staff notes
      </label>
      <textarea
        id="notes"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        rows={5}
        maxLength={5000}
        placeholder="Internal notes about this appeal (not visible to the appellant)."
        className="field-input resize-y"
      />

      {message && (
        <p
          className="mt-3 text-sm"
          style={{ color: message.type === "success" ? "var(--color-success)" : "var(--color-danger)" }}
          role="status"
        >
          {message.text}
        </p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving || !dirty}
        className="btn btn-primary mt-4"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
    </div>
  );
}
