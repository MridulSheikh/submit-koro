import { z } from "zod";

const userSortFields = ["createdAt", "name", "email", "status"] as const;
const userSortFieldSet = new Set<string>(userSortFields);
const userSortSchema = z.string().trim().min(1).refine(
  (sort) => sort.split(",").every((item) => userSortFieldSet.has(item.trim().replace(/^-/, ""))),
  "Unsupported user sort field",
);

export const getAllUsersQuerySchema = z.object({
  search: z.string().trim().min(1).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  roleKey: z.string().trim().min(1).max(50).optional(),
  sort: userSortSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
}).strict();

export type GetAllUsersQuery = z.infer<typeof getAllUsersQuerySchema>;

export const changeUserRoleSchema = z.object({
  body: z.object({
      roleKey: z.string().trim().min(2).max(50).regex(/^[A-Z][A-Z0-9_]*$/, "Role key must be uppercase letters, numbers, or underscores"),
  }).strict(),
});

export const changeUserStatusSchema = z.object({
  body: z.object({ status: z.enum(["ACTIVE", "INACTIVE"]) }).strict(),
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
