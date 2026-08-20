"use client";

import { useMemo } from "react";
import { TextInput, SelectInput } from "@/components/apply/fields";
import type { ApplicationFormValues, FormErrors } from "@/components/apply/formTypes";

function useTimezoneOptions(): string[] {
  return useMemo(() => {
    try {
      // Every IANA timezone identifier the runtime knows about, sorted
      // west-to-east so the list reads in a predictable order.
      return Intl.supportedValuesOf("timeZone").sort();
    } catch {
      // Intl.supportedValuesOf isn't available in this browser; fall back
      // to just the applicant's own detected zone so the field still works.
      try {
        return [Intl.DateTimeFormat().resolvedOptions().timeZone];
      } catch {
        return [];
      }
    }
  }, []);
}

interface StepProps {
  values: ApplicationFormValues;
  errors: FormErrors;
  setField: <K extends keyof ApplicationFormValues>(key: K, value: ApplicationFormValues[K]) => void;
  discordUsername: string;
  discordUserId: string | null;
}

export function StepOne({ values, errors, setField, discordUsername, discordUserId }: StepProps) {
  const timezoneOptions = useTimezoneOptions();

  return (
    <div>
      <div className="mb-5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] px-4 py-3">
        <p className="text-xs uppercase tracking-wide text-[var(--color-text-subtle)]">
          Applying as
        </p>
        <p className="mt-1 text-sm font-medium text-[var(--color-text)]">
          {discordUsername}
          {discordUserId && (
            <span className="ml-2 font-mono text-xs text-[var(--color-text-subtle)]">
              {discordUserId}
            </span>
          )}
        </p>
        <p className="field-hint mt-1">
          Taken from your Discord sign-in — not editable here.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <TextInput
          label="Age"
          value={values.age}
          onChange={(v) => setField("age", v.replace(/[^0-9]/g, ""))}
          required
          type="number"
          inputMode="numeric"
          placeholder="e.g. 19"
          error={errors.age}
        />
        <TextInput
          label="Country"
          value={values.country}
          onChange={(v) => setField("country", v)}
          required
          placeholder="e.g. Singapore"
          autoComplete="country-name"
          hint="Auto-detected from your location — change it if it's wrong."
          error={errors.country}
        />
        <SelectInput
          label="Timezone"
          value={values.timezone}
          onChange={(v) => setField("timezone", v)}
          options={timezoneOptions}
          required
          placeholder="Select your timezone"
          hint="Auto-detected from your browser — change it if it's wrong."
          error={errors.timezone}
        />
        <TextInput
          label="How long have you been in the server?"
          value={values.timeInServer}
          onChange={(v) => setField("timeInServer", v)}
          required
          placeholder="e.g. 8 months"
          error={errors.timeInServer}
        />
      </div>
    </div>
  );
}
