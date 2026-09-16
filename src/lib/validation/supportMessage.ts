import { z } from "zod";
import { longText } from "@/lib/validation/shared";

// No profanity filter here, same reasoning as case notes/application
// followups — staff may need to quote exactly what the member said.
export const addStaffSupportMessageSchema = z.object({
  message: z.string().trim().min(1, "Message can't be empty.").max(3000, "Must be 3000 characters or fewer."),
});

// Member-authored, so it goes through the same profanity filter as every
// other member-facing free-text field.
export const addMemberSupportMessageSchema = z.object({
  message: longText(1, 3000),
});
