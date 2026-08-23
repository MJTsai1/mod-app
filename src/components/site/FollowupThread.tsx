"use client";

import { useState } from "react";
import { useToast } from "@/components/site/ToastProvider";
import type { FollowupMessage } from "@/lib/followups";

interface Props {
  endpoint: string;
  initialMessages: FollowupMessage[];
  placeholder: string;
  submitLabel?: string;
  onSent?: (newStatus?: string) => void;
}

export function FollowupThread({
  endpoint,
  initialMessages,
  placeholder,
  submitLabel = "Send",
  onSent,
}: Props) {
  const { showToast } = useToast();
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSend() {
    const trimmed = draft.trim();
    if (!trimmed) return;

    setSending(true);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      const body = await response.json().catch(() => null);
      if (!response.ok) {
        showToast(body?.error ?? "Failed to send message.", "error");
        return;
      }

      setMessages((prev) => [...prev, body.message]);
      setDraft("");
      onSent?.(body.status);
    } catch {
      showToast("Network error — please try again.", "error");
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      {messages.length === 0 ? (
        <p className="text-sm text-[var(--color-text-subtle)]">No messages yet.</p>
      ) : (
        <ul className="mb-4 space-y-4">
          {messages.map((message) => (
            <li key={message.id}>
              <p className="whitespace-pre-wrap text-sm text-[var(--color-text)]">{message.message}</p>
              <p className="mt-1 text-xs text-[var(--color-text-subtle)]">
                {message.authorName} · {new Date(message.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}

      <textarea
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        rows={3}
        maxLength={3000}
        placeholder={placeholder}
        className="field-input resize-y"
      />
      <button
        type="button"
        onClick={handleSend}
        disabled={sending || !draft.trim()}
        className="btn btn-secondary mt-2"
      >
        {sending ? "Sending…" : submitLabel}
      </button>
    </div>
  );
}
