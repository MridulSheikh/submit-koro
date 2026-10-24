import { z } from "zod";

export const changeUserRoleSchema = z.object({
  body: z.object({
      roleKey: z.string().trim().min(2).max(50).regex(/^[A-Z][A-Z0-9_]*$/, "Role key must be uppercase letters, numbers, or underscores"),
  }).strict(),
});

export const updateProfileSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(1).max(100).optional(),
      image: z.string().url().nullable().optional(),
    })
    .strict()
    .refine((body) => Object.keys(body).length > 0, {
      message: "Provide at least one profile field to update",
    }),
});

export const changePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: z.string().min(1, "Current password is required"),
      newPassword: z
        .string()
        .min(8, "New password must be at least 8 characters")
        .max(128, "New password must be at most 128 characters"),
    })
    .strict()
    .refine((body) => body.currentPassword !== body.newPassword, {
      message: "New password must be different from the current password",
      path: ["newPassword"],
    }),
});
