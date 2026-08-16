"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  applicationSchema,
  applicationStepSchemas,
} from "@/lib/validation/application";
import {
  DRAFT_STORAGE_KEY,
  emptyApplicationFormValues,
  type ApplicationFormValues,
  type FormErrors,
} from "@/components/apply/formTypes";
import { ProgressBar } from "@/components/apply/ProgressBar";
import { StepOne } from "@/components/apply/steps/StepOne";
import { StepTwo } from "@/components/apply/steps/StepTwo";
import { StepThree } from "@/components/apply/steps/StepThree";
import { StepFour } from "@/components/apply/steps/StepFour";
import { StepFive } from "@/components/apply/steps/StepFive";
import { TurnstileWidget } from "@/components/apply/Turnstile";

const TOTAL_STEPS = 5;

const STEP_FIELD_NAMES: (keyof ApplicationFormValues)[][] = [
  ["age", "country", "timezone", "timeInServer"],
  ["activityLevel", "onlineTimes", "weeklyHours"],
  ["hasModeratedBefore", "previousExperience", "botsToolsUsed", "previousStaffPositions"],
  [
    "scenarioUnawareRules",
    "scenarioToxicConflict",
    "scenarioFriendBreaksRule",
    "scenarioStaffAbuse",
    "scenarioBiasedReport",
  ],
  [
    "motivationWhy",
    "motivationSuitable",
    "motivationGoodModerator",
    "motivationImproveServer",
    "additionalInfo",
    "confirmedAccurate",
  ],
];

function loadDraft(): ApplicationFormValues {
  if (typeof window === "undefined") return emptyApplicationFormValues;
  try {
    const raw = window.sessionStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return emptyApplicationFormValues;
    const parsed = JSON.parse(raw);
    return { ...emptyApplicationFormValues, ...parsed };
  } catch {
    return emptyApplicationFormValues;
  }
}

interface ApplicationFormProps {
  turnstileSiteKey?: string;
  discordUsername: string;
  discordUserId: string | null;
}

export function ApplicationForm({
  turnstileSiteKey,
  discordUsername,
  discordUserId,
}: ApplicationFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<ApplicationFormValues>(emptyApplicationFormValues);
  const [hydrated, setHydrated] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const submittingRef = useRef(false);
  const topRef = useRef<HTMLDivElement>(null);

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

  function setField<K extends keyof ApplicationFormValues>(key: K, value: ApplicationFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function validateStep(stepIndex: number): boolean {
    const schema = applicationStepSchemas[stepIndex];
    const result = schema.safeParse(values);
    if (result.success) {
      setErrors((prev) => {
        const next = { ...prev };
        for (const key of STEP_FIELD_NAMES[stepIndex]) {
          delete next[key];
        }
        return next;
      });
      return true;
    }

    const fieldErrors = result.error.flatten().fieldErrors;
    setErrors((prev) => ({
      ...prev,
      ...Object.fromEntries(
        Object.entries(fieldErrors).map(([key, messages]) => [key, messages?.[0]])
      ),
    }));
    return false;
  }

  function scrollToTop() {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleNext() {
    if (validateStep(currentStep)) {
      setCurrentStep((step) => Math.min(step + 1, TOTAL_STEPS - 1));
      scrollToTop();
    }
  }

  function handlePrevious() {
    setCurrentStep((step) => Math.max(step - 1, 0));
    scrollToTop();
  }

  async function handleSubmit() {
    if (submittingRef.current) return;

    // Validate every step so edits made after going "back" are re-checked.
    let firstInvalidStep: number | null = null;
    for (let step = 0; step < TOTAL_STEPS; step++) {
      const ok = validateStep(step);
      if (!ok && firstInvalidStep === null) firstInvalidStep = step;
    }

    if (firstInvalidStep !== null) {
      setCurrentStep(firstInvalidStep);
      setSubmitError("Please fix the highlighted fields before submitting.");
      scrollToTop();
      return;
    }

    const parsed = applicationSchema.safeParse(values);
    if (!parsed.success) {
      setSubmitError("Please fix the highlighted fields before submitting.");
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...parsed.data, turnstileToken }),
      });

      const body = await response.json().catch(() => null);

      if (!response.ok) {
        if (body?.fieldErrors) {
          setErrors((prev) => ({
            ...prev,
            ...Object.fromEntries(
              Object.entries(body.fieldErrors as Record<string, string[]>).map(
                ([key, messages]) => [key, messages?.[0]]
              )
            ),
          }));
        }
        setSubmitError(
          body?.error ?? "Something went wrong submitting your application. Please try again."
        );
        setSubmitting(false);
        submittingRef.current = false;
        return;
      }

      try {
        window.sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {
        // ignore
      }

      router.push(`/apply/success?ref=${encodeURIComponent(body.referenceCode)}`);
    } catch {
      setSubmitError(
        "We couldn't reach the server. Check your connection and try again — your answers are still here."
      );
      setSubmitting(false);
      submittingRef.current = false;
    }
  }

  if (!hydrated) {
    return (
      <div className="card-elevated mx-auto max-w-2xl p-8 text-center text-[var(--color-text-muted)]">
        Loading application form&hellip;
      </div>
    );
  }

  const steps = [
    <StepOne
      key={0}
      values={values}
      errors={errors}
      setField={setField}
      discordUsername={discordUsername}
      discordUserId={discordUserId}
    />,
    <StepTwo key={1} values={values} errors={errors} setField={setField} />,
    <StepThree key={2} values={values} errors={errors} setField={setField} />,
    <StepFour key={3} values={values} errors={errors} setField={setField} />,
    <StepFive key={4} values={values} errors={errors} setField={setField} />,
  ];

  const isLastStep = currentStep === TOTAL_STEPS - 1;

  return (
    <div ref={topRef} className="mx-auto max-w-2xl">
      <ProgressBar currentStep={currentStep} />

      <div className="card-elevated p-6 sm:p-8">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (isLastStep) {
              handleSubmit();
            } else {
              handleNext();
            }
          }}
          noValidate
        >
          {steps[currentStep]}

          {isLastStep && turnstileSiteKey && (
            <div className="mt-6">
              <TurnstileWidget siteKey={turnstileSiteKey} onVerify={setTurnstileToken} />
            </div>
          )}

          {submitError && (
            <div
              className="mt-6 rounded-xl border px-4 py-3 text-sm"
              style={{
                borderColor: "var(--color-danger)",
                background: "var(--color-danger-bg)",
                color: "var(--color-danger)",
              }}
              role="alert"
            >
              {submitError}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between gap-3 border-t border-[var(--color-border)] pt-6">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 0 || submitting}
              className="btn btn-ghost"
            >
              Previous
            </button>

            {isLastStep ? (
              <button type="submit" disabled={submitting} className="btn btn-primary">
                {submitting ? "Submitting…" : "Submit Application"}
              </button>
            ) : (
              <button type="submit" className="btn btn-primary">
                Next
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
