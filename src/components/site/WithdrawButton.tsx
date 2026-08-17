"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function WithdrawButton({ endpoint }: { endpoint: string }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "confirming" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleWithdraw() {
    setState("loading");
    try {
      const response = await fetch(endpoint, { method: "POST" });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(body?.error ?? "Failed to withdraw.");
        setState("error");
        return;
      }
      setState("done");
      router.refresh();
    } catch {
      setError("Network error — please try again.");
      setState("error");
    }
  }

  if (state === "done") {
    return <span className="text-xs text-[var(--color-text-subtle)]">Withdrawn.</span>;
  }

  if (state === "confirming" || state === "loading") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-[var(--color-text-subtle)]">Are you sure?</span>
        <button
          type="button"
          onClick={handleWithdraw}
          disabled={state === "loading"}
          className="text-xs font-medium text-[var(--color-danger)] hover:underline disabled:opacity-50"
        >
          {state === "loading" ? "Withdrawing…" : "Yes, withdraw"}
        </button>
        <button
          type="button"
          onClick={() => setState("idle")}
          disabled={state === "loading"}
          className="text-xs text-[var(--color-text-subtle)] hover:underline"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="text-right">
      <button
        type="button"
        onClick={() => setState("confirming")}
        className="text-xs font-medium text-[var(--color-danger)] hover:underline"
      >
        Withdraw
      </button>
      {state === "error" && error && <p className="mt-1 text-xs text-[var(--color-danger)]">{error}</p>}
    </div>
  );
}
