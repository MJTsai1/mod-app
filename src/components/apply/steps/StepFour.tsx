"use client";

import { TextArea } from "@/components/apply/fields";
import { siteConfig } from "@/lib/config";
import type { ApplicationFormValues, FormErrors } from "@/components/apply/formTypes";

interface StepProps {
  values: ApplicationFormValues;
  errors: FormErrors;
  setField: <K extends keyof ApplicationFormValues>(key: K, value: ApplicationFormValues[K]) => void;
}

const SCENARIO_FIELDS = [
  { configId: "scenario_unaware_rules", field: "scenarioUnawareRules" },
  { configId: "scenario_toxic_conflict", field: "scenarioToxicConflict" },
  { configId: "scenario_friend_breaks_rule", field: "scenarioFriendBreaksRule" },
  { configId: "scenario_staff_abuse", field: "scenarioStaffAbuse" },
  { configId: "scenario_biased_report", field: "scenarioBiasedReport" },
] as const;

export function StepFour({ values, errors, setField }: StepProps) {
  return (
    <div className="grid grid-cols-1 gap-6">
      {SCENARIO_FIELDS.map(({ configId, field }, index) => {
        const question = siteConfig.scenarioQuestions.find((q) => q.id === configId)?.question ?? "";
        return (
          <TextArea
            key={field}
            label={`${index + 1}. ${question}`}
            value={values[field]}
            onChange={(v) => setField(field, v)}
            required
            rows={4}
            maxLength={2000}
            error={errors[field]}
          />
        );
      })}
    </div>
  );
}
