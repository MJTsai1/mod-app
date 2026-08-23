"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { WithdrawButton } from "@/components/site/WithdrawButton";
import { FollowupThread } from "@/components/site/FollowupThread";
import type { FollowupMessage } from "@/lib/followups";

const SEEN_STORAGE_PREFIX = "mod-app-seen-";

interface FollowupProps {
  endpoint: string;
  initialMessages: FollowupMessage[];
}

interface Props {
  id: string;
  reference: string;
  statusBadge: React.ReactNode;
  updatedAt: string;
  date: string;
  detail: string;
  withdrawEndpoint: string;
  canWithdraw: boolean;
  /** Only set for applications currently awaiting a reply from the applicant. */
  followup?: FollowupProps;
}

export function SubmissionRow({
  id,
  reference,
  statusBadge,
  updatedAt,
  date,
  detail,
  withdrawEndpoint,
  canWithdraw,
  followup,
}: Props) {
  const router = useRouter();
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    // Reading/writing localStorage must happen post-mount (no access to it
    // during server rendering), same reasoning as the application form's
    // draft-loading effect.
    /* eslint-disable react-hooks/set-state-in-effect */
    const key = `${SEEN_STORAGE_PREFIX}${id}`;
    try {
      const lastSeen = window.localStorage.getItem(key);
      setIsNew(!lastSeen || new Date(lastSeen) < new Date(updatedAt));
      window.localStorage.setItem(key, updatedAt);
    } catch {
      // localStorage unavailable (e.g. private browsing) — the "Updated"
      // badge is a nice-to-have, not required for the page to function.
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [id, updatedAt]);

  return (
    <div className="border-b border-[var(--color-border)] py-3 last:border-0">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-mono text-sm text-[var(--color-text)]">{reference}</p>
          <p className="text-xs text-[var(--color-text-subtle)]">
            {detail} · {new Date(date).toLocaleDateString()}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <div className="flex items-center gap-1.5">
            {isNew && (
              <span
                className="badge"
                style={{ background: "var(--color-danger-bg)", color: "var(--color-danger)" }}
              >
                Updated
              </span>
            )}
            {statusBadge}
          </div>
          {canWithdraw && <WithdrawButton endpoint={withdrawEndpoint} />}
        </div>
      </div>

      {followup && (
        <div className="mt-3 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] p-4">
          <p className="mb-3 text-sm font-medium text-[var(--color-text)]">
            Staff have a question for you — please reply below.
          </p>
          <FollowupThread
            endpoint={followup.endpoint}
            initialMessages={followup.initialMessages}
            placeholder="Type your reply…"
            submitLabel="Send reply"
            onSent={() => router.refresh()}
          />
        </div>
      )}
    </div>
  );
}
