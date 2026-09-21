"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { applicationStatusValues } from "@/lib/validation/application";
import type { ApplicationStatus } from "@/lib/supabase/types";
import { useToast } from "@/components/site/ToastProvider";
import { ClaimButton } from "@/components/admin/ClaimButton";

interface Props {
  applicationId: string;
  initialStatus: ApplicationStatus;
  reviewedBy: string | null;
  claimedBy: string | null;
  claimedByName: string | null;
  currentStaffId: string;
}

export function ApplicationReviewPanel({
  applicationId,
  initialStatus,
  reviewedBy,
  claimedBy,
  claimedByName,
  currentStaffId,
}: Props) {
  const t = useTranslations("review");
  const tStatus = useTranslations("status");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { showToast } = useToast();
  const [status, setStatus] = useState<ApplicationStatus>(initialStatus);
  const [saving, setSaving] = useState(false);
  const [claim, setClaim] = useState({ by: claimedBy, name: claimedByName });

  const dirty = status !== initialStatus;

  async function handleSave() {
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        showToast(body?.error ?? t("saveFailed"), "error");
        return;
      }

      showToast(t("changesSaved"));
      router.refresh();
    } catch {
      showToast(tCommon("networkError"), "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-[var(--color-text)]">{t("staffReview")}</h2>
        <div className="flex items-center gap-4">
          {reviewedBy && (
            <p className="text-xs text-[var(--color-text-subtle)]">{t("lastReviewedBy", { name: reviewedBy })}</p>
          )}
          <ClaimButton
            endpoint={`/api/admin/applications/${applicationId}`}
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
        {t("applicationStatus")}
      </label>
      <select
        id="status"
        value={status}
        onChange={(event) => setStatus(event.target.value as ApplicationStatus)}
        className="field-input mb-4 sm:max-w-xs"
      >
        {applicationStatusValues.map((s) => (
          <option key={s} value={s}>
            {tStatus(s)}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving || !dirty}
        className="btn btn-primary"
      >
        {saving ? t("saving") : t("saveChanges")}
      </button>
    </div>
  );
}
