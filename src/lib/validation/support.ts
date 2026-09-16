import { z } from "zod";
import { shortText, longText } from "@/lib/validation/shared";

export const supportRequestSchema = z.object({
  subject: shortText(150),
  message: longText(10, 3000),
});

export type SupportRequestInput = z.infer<typeof supportRequestSchema>;

export const supportStatusValues = ["open", "answered", "resolved", "withdrawn"] as const;
export type SupportStatusValue = (typeof supportStatusValues)[number];

export const updateSupportRequestSchema = z.object({
  status: z.enum(supportStatusValues).optional(),
  claim: z.enum(["claim", "unclaim"]).optional(),
});
