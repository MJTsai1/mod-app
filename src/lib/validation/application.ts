import { z } from "zod";
import { siteConfig } from "@/lib/config";
import { shortText, longText, optionalLongText } from "@/lib/validation/shared";
import { UNINHABITED_TIMEZONE } from "@/components/apply/formTypes";

const baseAgeSchema = z
  .coerce.number({ error: "Age must be a number." })
  .int("Age must be a whole number.")
  .min(1, "Enter a valid age.")
  .max(119, "Enter a valid age.");

export const ageSchema = siteConfig.minAge
  ? baseAgeSchema.min(
      siteConfig.minAge,
      `You must be at least ${siteConfig.minAge} to apply.`
    )
  : baseAgeSchema;

// discordUsername/discordUserId are intentionally not part of this schema —
// they come from the applicant's Discord sign-in session, never from
// client-submitted form data. See src/app/api/applications/route.ts.
export const stepOneSchema = z.object({
  age: ageSchema,
  country: shortText(80),
  timezone: shortText(60).refine((value) => value !== UNINHABITED_TIMEZONE, {
    message: "Please select a real timezone.",
  }),
  timeInServer: shortText(120),
});

export const stepTwoSchema = z.object({
  activityLevel: shortText(120),
  onlineTimes: shortText(200),
  weeklyHours: z.coerce
    .number({ error: "Weekly hours must be a number." })
    .min(0, "Weekly hours cannot be negative.")
    .max(168, "Enter a realistic number of hours."),
});

export const stepThreeSchema = z
  .object({
    hasModeratedBefore: z.boolean(),
    previousExperience: optionalLongText(2000),
    botsToolsUsed: optionalLongText(500),
    previousStaffPositions: optionalLongText(1000),
  })
  .superRefine((data, ctx) => {
    if (
      data.hasModeratedBefore &&
      (!data.previousExperience || data.previousExperience.trim().length < 10)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["previousExperience"],
        message:
          "Please describe your previous moderation experience (at least 10 characters).",
      });
    }
  });

export const stepFourSchema = z.object({
  scenarioUnawareRules: longText(10, 2000),
  scenarioToxicConflict: longText(10, 2000),
  scenarioFriendBreaksRule: longText(10, 2000),
  scenarioStaffAbuse: longText(10, 2000),
  scenarioBiasedReport: longText(10, 2000),
});

export const stepFiveSchema = z.object({
  motivationWhy: longText(10, 2000),
  motivationSuitable: longText(10, 2000),
  motivationGoodModerator: longText(10, 2000),
  motivationImproveServer: longText(10, 2000),
  additionalInfo: optionalLongText(2000),
  confirmedAccurate: z.literal(true, {
    error: "You must confirm your information is accurate to submit.",
  }),
});

export const applicationSchema = stepOneSchema
  .and(stepTwoSchema)
  .and(stepThreeSchema)
  .and(stepFourSchema)
  .and(stepFiveSchema);

export type ApplicationInput = z.infer<typeof applicationSchema>;

export const applicationStepSchemas = [
  stepOneSchema,
  stepTwoSchema,
  stepThreeSchema,
  stepFourSchema,
  stepFiveSchema,
] as const;

export const applicationStatusValues = [
  "pending",
  "reviewing",
  "accepted",
  "rejected",
  "withdrawn",
] as const;

export type ApplicationStatus = (typeof applicationStatusValues)[number];

export const updateApplicationSchema = z.object({
  status: z.enum(applicationStatusValues).optional(),
  claim: z.enum(["claim", "unclaim"]).optional(),
});
