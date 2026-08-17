import { z } from "zod";

// Deliberately no profanity filter here — staff may legitimately need to
// quote exactly what an applicant/reporter said.
export const addCaseNoteSchema = z.object({
  note: z.string().trim().min(1, "Note can't be empty.").max(5000, "Must be 5000 characters or fewer."),
});
