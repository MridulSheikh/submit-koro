import { z } from "zod";

const roleFieldsSchema = z.object({
  name: z.string().trim().min(1).max(80),
  key: z
    .string()
    .trim()
    .min(2)
    .max(50)
    .regex(/^[A-Z][A-Z0-9_]*$/, "Role key must be uppercase letters, numbers, or underscores"),
  overviewPermission: z.array(z.enum(["NO_ACCESS", "VIEW"])).optional(),
  reviewPermission: z.array(z.enum(["NO_ACCESS", "VIEW", "REVIEW"])).optional(),
  submissionPermission: z
    .array(z.enum(["NO_ACCESS", "VIEW", "SUBMIT"]))
    .optional(),
  teamPermission: z.array(z.enum(["NO_ACCESS", "VIEW", "MANAGE"])).optional(),
});

export const createRoleSchema = z.object({
  body: roleFieldsSchema.strict(),
});

export const updateRoleSchema = z.object({
  body: roleFieldsSchema
    .partial()
    .strict()
    .refine((body) => Object.keys(body).length > 0, {
      message: "Provide at least one field to update",
    }),
});
