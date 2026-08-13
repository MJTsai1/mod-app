"use client";

import { SelectInput, TextInput } from "@/components/apply/fields";
import type { ApplicationFormValues, FormErrors } from "@/components/apply/formTypes";

interface StepProps {
  values: ApplicationFormValues;
  errors: FormErrors;
  setField: <K extends keyof ApplicationFormValues>(key: K, value: ApplicationFormValues[K]) => void;
}

const ACTIVITY_LEVELS = [
  "Very active (daily)",
  "Active (most days)",
  "Moderate (a few times a week)",
  "Occasional (rarely online)",
];

export function StepTwo({ values, errors, setField }: StepProps) {
  return (
    <div className="grid grid-cols-1 gap-5">
      <SelectInput
        label="How active are you on Discord?"
        value={values.activityLevel}
        onChange={(v) => setField("activityLevel", v)}
        options={ACTIVITY_LEVELS}
        required
        error={errors.activityLevel}
      />
      <TextInput
        label="What times are you normally online?"
        value={values.onlineTimes}
        onChange={(v) => setField("onlineTimes", v)}
        required
        placeholder="e.g. Weekdays 6pm-11pm, weekends most of the day (in your timezone)"
        error={errors.onlineTimes}
      />
      <TextInput
        label="How many hours per week can you dedicate to moderation?"
        value={values.weeklyHours}
        onChange={(v) => setField("weeklyHours", v.replace(/[^0-9.]/g, ""))}
        required
        type="number"
        inputMode="numeric"
        placeholder="e.g. 10"
        error={errors.weeklyHours}
      />
    </div>
  );
}
