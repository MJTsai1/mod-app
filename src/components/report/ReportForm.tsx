"use client";

import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { reportSchema } from "@/lib/validation/report";
import { reportCategoryValues, reportCategoryLabels } from "@/lib/config";
import { TextInput, TextArea, FieldWrapper } from "@/components/apply/fields";

type FormValues = {
  reportedDiscordUsername: string;
  reportedDiscordUserId: string;
  category: (typeof reportCategoryValues)[number] | "";
  description: string;
  evidenceLinks: string;
};

const EMPTY: FormValues = {
  reportedDiscordUsername: "",
  reportedDiscordUserId: "",
  category: "",
  description: "",
  evidenceLinks: "",
};

export function ReportForm() {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const submittingRef = useRef(false);
  const categoryId = useId();

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

    const parsed = reportSchema.safeParse(values);
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
      const response = await fetch("/api/reports", {
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
        setSubmitError(body?.error ?? "Something went wrong submitting your report. Please try again.");
        setSubmitting(false);
        submittingRef.current = false;
        return;
      }

      router.push(`/report/success?ref=${encodeURIComponent(body.referenceCode)}`);
    } catch {
      setSubmitError("We couldn't reach the server. Check your connection and try again — your answers are still here.");
      setSubmitting(false);
      submittingRef.current = false;
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="card-elevated space-y-5 p-6 sm:p-8">
      <TextInput
        label="Reported member's Discord username"
        value={values.reportedDiscordUsername}
        onChange={(v) => setField("reportedDiscordUsername", v)}
        required
        error={errors.reportedDiscordUsername}
        placeholder="username or username#0000"
      />
      <TextInput
        label="Reported member's Discord User ID"
        value={values.reportedDiscordUserId}
        onChange={(v) => setField("reportedDiscordUserId", v)}
        error={errors.reportedDiscordUserId}
        hint="Optional, but helps us find the right person faster. Right-click their name in Discord and Copy User ID (Developer Mode must be enabled)."
        inputMode="numeric"
      />

      <FieldWrapper
        label="Category"
        required
        htmlFor={categoryId}
        error={errors.category}
      >
        <select
          id={categoryId}
          value={values.category}
          onChange={(event) => setField("category", event.target.value as FormValues["category"])}
          required
          className="field-input"
          aria-invalid={Boolean(errors.category)}
        >
          <option value="" disabled>
            Select a category
          </option>
          {reportCategoryValues.map((value) => (
            <option key={value} value={value}>
              {reportCategoryLabels[value]}
            </option>
          ))}
        </select>
      </FieldWrapper>

      <TextArea
        label="What happened?"
        value={values.description}
        onChange={(v) => setField("description", v)}
        required
        error={errors.description}
        rows={6}
        maxLength={3000}
        placeholder="Describe what happened, including roughly when and where (which channel/voice call)."
      />
      <TextArea
        label="Evidence links"
        value={values.evidenceLinks}
        onChange={(v) => setField("evidenceLinks", v)}
        error={errors.evidenceLinks}
        rows={3}
        maxLength={1000}
        placeholder="Links to screenshots, clips, or message links (optional but helpful)."
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
        {submitting ? "Submitting…" : "Submit Report"}
      </button>
    </form>
  );
}
