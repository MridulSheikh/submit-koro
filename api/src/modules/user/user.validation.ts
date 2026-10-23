import { z } from "zod";

export const changeUserRoleSchema = z.object({
  body: z.object({
      roleKey: z.string().trim().min(2).max(50).regex(/^[A-Z][A-Z0-9_]*$/, "Role key must be uppercase letters, numbers, or underscores"),
  }).strict(),
});
