import { z } from "zod";

export const updateProfileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
});

export const updatePreferencesSchema = z.object({
  language: z.string().optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  timezone: z.string().optional(),
});

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type IUpdateProfileSchema = z.infer<typeof updateProfileSchema>;
export type IUpdatePreferencesSchema = z.infer<typeof updatePreferencesSchema>;
export type IUpdatePasswordSchema = z.infer<typeof updatePasswordSchema>;
