"use client";

import { TextInput } from "@/components/apply/fields";
import type { ApplicationFormValues, FormErrors } from "@/components/apply/formTypes";

interface StepProps {
  values: ApplicationFormValues;
  errors: FormErrors;
  setField: <K extends keyof ApplicationFormValues>(key: K, value: ApplicationFormValues[K]) => void;
  discordUsername: string;
  discordUserId: string | null;
}

export function StepOne({ values, errors, setField, discordUsername, discordUserId }: StepProps) {
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
          error={errors.country}
        />
        <TextInput
          label="Timezone"
          value={values.timezone}
          onChange={(v) => setField("timezone", v)}
          required
          placeholder="e.g. GMT+8 / Australia/Sydney"
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
