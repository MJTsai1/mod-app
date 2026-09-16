"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supportRequestSchema } from "@/lib/validation/support";
import { TextInput, TextArea } from "@/components/apply/fields";

type FormValues = {
  subject: string;
  message: string;
};

const EMPTY: FormValues = {
  subject: "",
  message: "",
};

const DRAFT_STORAGE_KEY = "mod-app-support-draft-v1";

function loadDraft(): FormValues {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.sessionStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return EMPTY;
    return { ...EMPTY, ...JSON.parse(raw) };
  } catch {
    return EMPTY;
  }
}

export function SupportRequestForm() {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    // Reading sessionStorage must happen post-mount to avoid an SSR
    // hydration mismatch (the server has no access to browser storage).
    /* eslint-disable react-hooks/set-state-in-effect */
    setValues(loadDraft());
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(values));
    } catch {
      // sessionStorage unavailable (e.g. private browsing) — draft resilience
      // is a nice-to-have, not required for correct submission.
    }
  }, [values, hydrated]);

  function setField<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (submittingRef.current) return;

    const parsed = supportRequestSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors(
        Object.fromEntries(
          Object.entries(fieldErrors).map(([key, messages]) => [key, messages?.[0] ?? ""])
        )
      );
      setSubmitError("Please fix the highlighted fields before submitting.");
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/support-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const body = await response.json().catch(() => null);

      if (!response.ok) {
        if (body?.fieldErrors) {
          setErrors(
            Object.fromEntries(
              Object.entries(body.fieldErrors as Record<string, string[]>).map(
                ([key, messages]) => [key, messages?.[0]]
              )
            )
          );
        }
        setSubmitError(body?.error ?? "Something went wrong submitting your request. Please try again.");
        setSubmitting(false);
        submittingRef.current = false;
        return;
      }

      try {
        window.sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {
        // ignore
      }

      router.push(`/support/success?ref=${encodeURIComponent(body.referenceCode)}`);
    } catch {
      setSubmitError("We couldn't reach the server. Check your connection and try again — your answers are still here.");
      setSubmitting(false);
      submittingRef.current = false;
    }
  }

  if (!hydrated) {
    return (
      <div className="card-elevated p-8 text-center text-[var(--color-text-muted)]">
        Loading form&hellip;
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="card-elevated space-y-5 p-6 sm:p-8">
      <TextInput
        label="Subject"
        value={values.subject}
        onChange={(v) => setField("subject", v)}
        required
        error={errors.subject}
        placeholder="A short summary of what you need help with"
        maxLength={150}
      />
      <TextArea
        label="What do you need help with?"
        value={values.message}
        onChange={(v) => setField("message", v)}
        required
        error={errors.message}
        rows={6}
        maxLength={3000}
        placeholder="Describe your question or issue — a staff member will reply here."
      />

      {submitError && (
        <div
          className="rounded-xl border px-4 py-3 text-sm"
          style={{ borderColor: "var(--color-danger)", background: "var(--color-danger-bg)", color: "var(--color-danger)" }}
          role="alert"
        >
          {submitError}
        </div>
      )}

      <button type="submit" disabled={submitting} className="btn btn-primary w-full sm:w-auto">
        {submitting ? "Submitting…" : "Submit Support Request"}
      </button>
    </form>
  );
}
