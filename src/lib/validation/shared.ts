import { z } from "zod";
import { containsProfanity } from "@/lib/profanity";

export const NO_PROFANITY_MESSAGE = "No vulgar words are allowed in your submission.";
export const noProfanity = (val: string) => !containsProfanity(val);

export const shortText = (max: number) =>
  z
    .string()
    .trim()
    .min(1, "This field is required.")
    .max(max, `Must be ${max} characters or fewer.`)
    .refine(noProfanity, NO_PROFANITY_MESSAGE);

export const longText = (min: number, max: number) =>
  z
    .string()
    .trim()
    .min(min, `Please provide at least ${min} characters.`)
    .max(max, `Must be ${max} characters or fewer.`)
    .refine(noProfanity, NO_PROFANITY_MESSAGE);

export const optionalLongText = (max: number) =>
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
