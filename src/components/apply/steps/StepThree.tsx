"use client";

import { TextArea, YesNoToggle } from "@/components/apply/fields";
import type { ApplicationFormValues, FormErrors } from "@/components/apply/formTypes";

interface StepProps {
  values: ApplicationFormValues;
  errors: FormErrors;
  setField: <K extends keyof ApplicationFormValues>(key: K, value: ApplicationFormValues[K]) => void;
}

export function StepThree({ values, errors, setField }: StepProps) {
  return (
    <div className="grid grid-cols-1 gap-5">
      <YesNoToggle
        label="Have you moderated a Discord server before?"
        value={values.hasModeratedBefore}
        onChange={(v) => setField("hasModeratedBefore", v)}
        error={errors.hasModeratedBefore}
      />
      <TextArea
        label="Describe your previous moderation experience"
        value={values.previousExperience}
        onChange={(v) => setField("previousExperience", v)}
        required={values.hasModeratedBefore}
        placeholder="Which servers, how large, what did you do day-to-day?"
        rows={4}
        maxLength={2000}
        error={errors.previousExperience}
      />
      <TextArea
        label="What moderation bots/tools have you used?"
        value={values.botsToolsUsed}
        onChange={(v) => setField("botsToolsUsed", v)}
        placeholder="e.g. Dyno, MEE6, Carl-bot, AutoMod..."
        rows={2}
        maxLength={500}
        error={errors.botsToolsUsed}
      />
      <TextArea
        label="Have you previously been staff somewhere else?"
        value={values.previousStaffPositions}
        onChange={(v) => setField("previousStaffPositions", v)}
        placeholder="List any other communities and your role there."
        rows={3}
        maxLength={1000}
        error={errors.previousStaffPositions}
      />
    </div>
  );
}
