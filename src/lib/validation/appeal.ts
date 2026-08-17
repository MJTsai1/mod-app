import { z } from "zod";
import {
  discordUsernameSchema,
  discordUserIdSchema,
  longText,
  optionalLongText,
} from "@/lib/validation/shared";

export const appealSchema = z.object({
  discordUsername: discordUsernameSchema,
  discordUserId: discordUserIdSchema,
  banReason: optionalLongText(1000),
  appealReason: longText(20, 3000),
  additionalInfo: optionalLongText(2000),
});

export type AppealInput = z.infer<typeof appealSchema>;

export const appealStatusValues = [
  "pending",
  "reviewing",
  "approved",
  "denied",
  "withdrawn",
] as const;
export type AppealStatusValue = (typeof appealStatusValues)[number];

export const updateAppealSchema = z.object({
  status: z.enum(appealStatusValues).optional(),
  staffNotes: z.string().max(5000).optional(),
  claim: z.enum(["claim", "unclaim"]).optional(),
});
