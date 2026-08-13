import { z } from "zod";

export const staffRoleValues = ["staff", "admin"] as const;
export type StaffRole = (typeof staffRoleValues)[number];

export const createStaffSchema = z.object({
  email: z.email({ error: "Enter a valid email address." }).trim().toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(72, "Password must be 72 characters or fewer."),
  displayName: z
    .string()
    .trim()
    .max(100, "Name must be 100 characters or fewer.")
    .optional()
    .or(z.literal("")),
  role: z.enum(staffRoleValues),
});
