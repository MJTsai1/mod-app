"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { reportStatusValues } from "@/lib/validation/report";
import type { ReportStatus } from "@/lib/supabase/types";
import { useToast } from "@/components/site/ToastProvider";

interface Props {
  reportId: string;
  initialStatus: ReportStatus;
  initialNotes: string;
  reviewedBy: string | null;
}

export function ReportReviewPanel({ reportId, initialStatus, initialNotes, reviewedBy }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const [status, setStatus] = useState<ReportStatus>(initialStatus);
  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);

  const dirty = status !== initialStatus || notes !== initialNotes;

  async function handleSave() {
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, staffNotes: notes }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        showToast(body?.error ?? "Failed to save changes.", "error");
        return;
      }

      showToast("Changes saved.");
      router.refresh();
    } catch {
      showToast("Network error — please try again.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--color-text)]">Staff Review</h2>
        {reviewedBy && (
          <p className="text-xs text-[var(--color-text-subtle)]">Last reviewed by {reviewedBy}</p>
        )}
      </div>

      <label htmlFor="status" className="field-label">
        Report status
      </label>
      <select
        id="status"
        value={status}
        onChange={(event) => setStatus(event.target.value as ReportStatus)}
        className="field-input mb-4 sm:max-w-xs"
      >
        {reportStatusValues.map((s) => (
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
        placeholder="Internal notes about this report (not visible to the reporter)."
        className="field-input resize-y"
      />

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
