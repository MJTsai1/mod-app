"use client";

import { useTranslations } from "next-intl";
import { TextArea, YesNoToggle } from "@/components/apply/fields";
import type { ApplicationFormValues, FormErrors } from "@/components/apply/formTypes";

interface StepProps {
  values: ApplicationFormValues;
  errors: FormErrors;
  setField: <K extends keyof ApplicationFormValues>(key: K, value: ApplicationFormValues[K]) => void;
}

export function StepThree({ values, errors, setField }: StepProps) {
  const t = useTranslations("apply.fields");

  return (
    <div className="grid grid-cols-1 gap-5">
      <YesNoToggle
        label={t("hasModeratedBefore")}
        value={values.hasModeratedBefore}
        onChange={(v) => setField("hasModeratedBefore", v)}
        error={errors.hasModeratedBefore}
      />
      <TextArea
        label={t("previousExperience")}
        value={values.previousExperience}
        onChange={(v) => setField("previousExperience", v)}
        required={values.hasModeratedBefore}
        placeholder={t("previousExperiencePlaceholder")}
        rows={4}
        maxLength={2000}
        error={errors.previousExperience}
      />
      <TextArea
        label={t("botsToolsUsed")}
        value={values.botsToolsUsed}
        onChange={(v) => setField("botsToolsUsed", v)}
        placeholder={t("botsToolsUsedPlaceholder")}
        rows={2}
        maxLength={500}
        error={errors.botsToolsUsed}
      />
      <TextArea
        label={t("previousStaffPositions")}
        value={values.previousStaffPositions}
        onChange={(v) => setField("previousStaffPositions", v)}
        placeholder={t("previousStaffPositionsPlaceholder")}
        rows={3}
        maxLength={1000}
        error={errors.previousStaffPositions}
      />
    </div>
  );
}
