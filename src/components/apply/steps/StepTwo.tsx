"use client";

import { useTranslations } from "next-intl";
import { SelectInput, TextInput } from "@/components/apply/fields";
import type { ApplicationFormValues, FormErrors } from "@/components/apply/formTypes";

interface StepProps {
  values: ApplicationFormValues;
  errors: FormErrors;
  setField: <K extends keyof ApplicationFormValues>(key: K, value: ApplicationFormValues[K]) => void;
}

export function StepTwo({ values, errors, setField }: StepProps) {
  const t = useTranslations("apply");
  const activityLevels = t.raw("fields.activityLevels") as string[];

  return (
    <div className="grid grid-cols-1 gap-5">
      <SelectInput
        label={t("fields.activityLevel")}
        value={values.activityLevel}
        onChange={(v) => setField("activityLevel", v)}
        options={activityLevels}
        required
        error={errors.activityLevel}
      />
      <TextInput
        label={t("fields.onlineTimes")}
        value={values.onlineTimes}
        onChange={(v) => setField("onlineTimes", v)}
        required
        placeholder={t("fields.onlineTimesPlaceholder")}
        error={errors.onlineTimes}
      />
      <TextInput
        label={t("fields.weeklyHours")}
        value={values.weeklyHours}
        onChange={(v) => setField("weeklyHours", v.replace(/[^0-9.]/g, ""))}
        required
        type="number"
        inputMode="numeric"
        placeholder={t("fields.weeklyHoursPlaceholder")}
        error={errors.weeklyHours}
      />
    </div>
  );
}
