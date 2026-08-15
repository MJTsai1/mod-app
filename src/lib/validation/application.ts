import { z } from "zod";
import { siteConfig } from "@/lib/config";
import { containsProfanity } from "@/lib/profanity";

const NO_PROFANITY_MESSAGE = "No vulgar words are allowed in your application.";
const noProfanity = (val: string) => !containsProfanity(val);

const shortText = (max: number) =>
  z
    .string()
    .trim()
    .min(1, "This field is required.")
    .max(max, `Must be ${max} characters or fewer.`)
    .refine(noProfanity, NO_PROFANITY_MESSAGE);

const longText = (min: number, max: number) =>
  z
    .string()
    .trim()
    .min(min, `Please provide at least ${min} characters.`)
    .max(max, `Must be ${max} characters or fewer.`)
    .refine(noProfanity, NO_PROFANITY_MESSAGE);

const optionalLongText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Must be ${max} characters or fewer.`)
    .refine(noProfanity, NO_PROFANITY_MESSAGE)
    .optional()
    .or(z.literal(""));

export const discordUserIdSchema = z
  .string()
  .trim()
  .regex(/^\d{15,25}$/, "Enter a valid Discord User ID (numbers only).");

export const discordUsernameSchema = z
  .string()
  .trim()
  .min(2, "Discord username must be at least 2 characters.")
  .max(32, "Discord username must be 32 characters or fewer.")
  .regex(
    /^[a-z0-9._]+$|^.{2,32}#\d{4}$/i,
    "Enter a valid Discord username (e.g. username or username#0000)."
  )
  .refine(noProfanity, NO_PROFANITY_MESSAGE);

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

export const stepOneSchema = z.object({
  discordUsername: discordUsernameSchema,
  discordUserId: discordUserIdSchema,
  age: ageSchema,
  country: shortText(80),
  timezone: shortText(60),
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
  staffNotes: z.string().max(5000).optional(),
});
