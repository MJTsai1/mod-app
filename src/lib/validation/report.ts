import { z } from "zod";
import { shortText, longText, optionalLongText, discordUserIdSchema } from "@/lib/validation/shared";
import { reportCategoryValues } from "@/lib/config";

export const reportSchema = z.object({
  reportedDiscordUsername: shortText(100),
  reportedDiscordUserId: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (val) => !val || discordUserIdSchema.safeParse(val).success,
      "If provided, enter a valid Discord User ID (numbers only)."
    ),
  category: z.enum(reportCategoryValues, { error: "Select a category." }),
  description: longText(10, 3000),
  evidenceLinks: optionalLongText(1000),
});

export type ReportInput = z.infer<typeof reportSchema>;

export const reportStatusValues = ["pending", "reviewing", "resolved", "dismissed"] as const;
export type ReportStatusValue = (typeof reportStatusValues)[number];

export const updateReportSchema = z.object({
  status: z.enum(reportStatusValues).optional(),
  staffNotes: z.string().max(5000).optional(),
});
