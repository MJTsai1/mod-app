"use client";

import { useState } from "react";
import { useToast } from "@/components/site/ToastProvider";
import type { CaseNote } from "@/lib/caseNotes";

export function NotesThread({ endpoint, initialNotes }: { endpoint: string; initialNotes: CaseNote[] }) {
  const { showToast } = useToast();
  const [notes, setNotes] = useState(initialNotes);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    const trimmed = draft.trim();
    if (!trimmed) return;

    setSaving(true);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: trimmed }),
      });

      const body = await response.json().catch(() => null);
      if (!response.ok) {
        showToast(body?.error ?? "Failed to add note.", "error");
        return;
      }

      setNotes((prev) => [body.note, ...prev]);
      setDraft("");
    } catch {
      showToast("Network error — please try again.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <textarea
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        rows={3}
        maxLength={5000}
        placeholder="Add a note for other staff (not visible to the submitter)…"
        className="field-input resize-y"
      />
      <button
        type="button"
        onClick={handleAdd}
        disabled={saving || !draft.trim()}
        className="btn btn-secondary mt-2"
      >
        {saving ? "Adding…" : "Add note"}
      </button>

      {notes.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--color-text-subtle)]">No notes yet.</p>
      ) : (
        <ul className="mt-5 space-y-4 border-t border-[var(--color-border)] pt-4">
          {notes.map((note) => (
            <li key={note.id}>
              <p className="whitespace-pre-wrap text-sm text-[var(--color-text)]">{note.note}</p>
              <p className="mt-1 text-xs text-[var(--color-text-subtle)]">
                {note.authorName} · {new Date(note.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
