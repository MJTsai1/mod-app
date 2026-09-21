"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useToast } from "@/components/site/ToastProvider";

interface Props {
  endpoint: string;
  claimedBy: string | null;
  claimedByName: string | null;
  currentStaffId: string;
  onUpdated: (claimedBy: string | null, claimedByName: string | null) => void;
}

export function ClaimButton({ endpoint, claimedBy, claimedByName, currentStaffId, onUpdated }: Props) {
  const t = useTranslations("claim");
  const tCommon = useTranslations("common");
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);

  const isMine = claimedBy === currentStaffId;
  const isClaimedByOther = Boolean(claimedBy) && !isMine;

  async function handleClick(event: React.MouseEvent) {
    event.stopPropagation();
    if (isClaimedByOther || saving) return;

    setSaving(true);
    try {
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim: isMine ? "unclaim" : "claim" }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        showToast(body?.error ?? t("updateFailed"), "error");
        return;
      }

      onUpdated(isMine ? null : currentStaffId, isMine ? null : t("you"));
    } catch {
      showToast(tCommon("networkError"), "error");
    } finally {
      setSaving(false);
    }
  }

  if (isClaimedByOther) {
    return (
      <span className="text-xs text-[var(--color-text-subtle)]">
        {t("claimedBy", { name: claimedByName ?? t("someoneElse") })}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={saving}
      className="text-xs font-medium text-[var(--color-accent-soft)] hover:underline disabled:opacity-50"
    >
      {isMine ? t("unclaim") : t("claim")}
    </button>
  );
}
