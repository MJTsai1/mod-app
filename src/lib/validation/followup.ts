import { z } from "zod";
import { longText } from "@/lib/validation/shared";

// No profanity filter here, same reasoning as case notes — staff may need
// to quote exactly what the applicant said when asking a follow-up.
export const addStaffFollowupSchema = z.object({
  message: z.string().trim().min(1, "Message can't be empty.").max(3000, "Must be 3000 characters or fewer."),
});

// Applicant-authored, so it goes through the same profanity filter as every
// other applicant-facing free-text field.
export const addApplicantFollowupSchema = z.object({
  message: longText(1, 3000),
});
