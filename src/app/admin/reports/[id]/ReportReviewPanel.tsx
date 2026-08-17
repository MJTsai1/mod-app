"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { reportStatusValues } from "@/lib/validation/report";
import type { ReportStatus } from "@/lib/supabase/types";
import { useToast } from "@/components/site/ToastProvider";
import { ClaimButton } from "@/components/admin/ClaimButton";

interface Props {
  reportId: string;
  initialStatus: ReportStatus;
  reviewedBy: string | null;
  claimedBy: string | null;
  claimedByName: string | null;
  currentStaffId: string;
}

export function ReportReviewPanel({
  reportId,
  initialStatus,
  reviewedBy,
  claimedBy,
  claimedByName,
  currentStaffId,
}: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const [status, setStatus] = useState<ReportStatus>(initialStatus);
  const [saving, setSaving] = useState(false);
  const [claim, setClaim] = useState({ by: claimedBy, name: claimedByName });

  const dirty = status !== initialStatus;

  async function handleSave() {
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
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
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-[var(--color-text)]">Staff Review</h2>
        <div className="flex items-center gap-4">
          {reviewedBy && (
            <p className="text-xs text-[var(--color-text-subtle)]">Last reviewed by {reviewedBy}</p>
          )}
          <ClaimButton
            endpoint={`/api/admin/reports/${reportId}`}
            claimedBy={claim.by}
            claimedByName={claim.name}
            currentStaffId={currentStaffId}
            onUpdated={(claimedBy, claimedByName) => {
              setClaim({ by: claimedBy, name: claimedByName });
              router.refresh();
            }}
          />
        </div>
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

      <button
        type="button"
        onClick={handleSave}
        disabled={saving || !dirty}
        className="btn btn-primary"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
    </div>
  );
}
