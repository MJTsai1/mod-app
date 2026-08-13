"use client";

import { TextArea } from "@/components/apply/fields";
import { siteConfig } from "@/lib/config";
import type { ApplicationFormValues, FormErrors } from "@/components/apply/formTypes";

interface StepProps {
  values: ApplicationFormValues;
  errors: FormErrors;
  setField: <K extends keyof ApplicationFormValues>(key: K, value: ApplicationFormValues[K]) => void;
}

const MOTIVATION_FIELDS = [
  { configId: "motivation_why", field: "motivationWhy" },
  { configId: "motivation_suitable", field: "motivationSuitable" },
  { configId: "motivation_good_moderator", field: "motivationGoodModerator" },
  { configId: "motivation_improve_server", field: "motivationImproveServer" },
] as const;

export function StepFive({ values, errors, setField }: StepProps) {
  return (
    <div className="grid grid-cols-1 gap-6">
      {MOTIVATION_FIELDS.map(({ configId, field }) => {
        const question = siteConfig.motivationQuestions.find((q) => q.id === configId)?.question ?? "";
        return (
          <TextArea
            key={field}
            label={question}
            value={values[field]}
            onChange={(v) => setField(field, v)}
            required
            rows={4}
            maxLength={2000}
            error={errors[field]}
          />
        );
      })}

      <TextArea
        label="Is there anything else you'd like the staff team to know?"
        value={values.additionalInfo}
        onChange={(v) => setField("additionalInfo", v)}
        rows={3}
        maxLength={2000}
        error={errors.additionalInfo}
      />

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] p-4">
        <input
          type="checkbox"
          checked={values.confirmedAccurate}
          onChange={(event) => setField("confirmedAccurate", event.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-accent)]"
        />
        <span className="text-sm text-[var(--color-text)]">
          {siteConfig.confirmationStatement}
        </span>
      </label>
      {errors.confirmedAccurate && (
        <p className="field-error -mt-4" role="alert">
          {errors.confirmedAccurate}
        </p>
      )}
    </div>
  );
}
