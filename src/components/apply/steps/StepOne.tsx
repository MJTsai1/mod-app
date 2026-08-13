"use client";

import { TextInput } from "@/components/apply/fields";
import type { ApplicationFormValues, FormErrors } from "@/components/apply/formTypes";

interface StepProps {
  values: ApplicationFormValues;
  errors: FormErrors;
  setField: <K extends keyof ApplicationFormValues>(key: K, value: ApplicationFormValues[K]) => void;
}

export function StepOne({ values, errors, setField }: StepProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <TextInput
        label="Discord username"
        value={values.discordUsername}
        onChange={(v) => setField("discordUsername", v)}
        required
        placeholder="e.g. yourname"
        autoComplete="off"
        error={errors.discordUsername}
        hint="Your current Discord username (not your server nickname)."
      />
      <TextInput
        label="Discord User ID"
        value={values.discordUserId}
        onChange={(v) => setField("discordUserId", v)}
        required
        placeholder="e.g. 123456789012345678"
        inputMode="numeric"
        autoComplete="off"
        error={errors.discordUserId}
        hint="Enable Developer Mode in Discord, then right-click your profile and Copy User ID."
      />
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
  );
}
