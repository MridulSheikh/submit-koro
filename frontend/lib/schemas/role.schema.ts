import { z } from "zod";

const permissionArrays = {
  overviewPermission: z.array(z.enum(["NO_ACCESS", "VIEW"])).min(1, "Choose a permission"),
  reviewPermission: z.array(z.enum(["NO_ACCESS", "VIEW", "REVIEW"])).min(1, "Choose a permission"),
  submissionPermission: z.array(z.enum(["NO_ACCESS", "VIEW", "SUBMIT"])).min(1, "Choose a permission"),
  teamPermission: z.array(z.enum(["NO_ACCESS", "VIEW", "MANAGE"])).min(1, "Choose a permission"),
};

export const roleSchema = z.object({
  name: z.string().trim().min(1, "Role name is required").max(80, "Name must be 80 characters or fewer"),
  key: z.string().trim().min(2, "Role key must have at least 2 characters").max(50, "Role key must be 50 characters or fewer").regex(/^[A-Z][A-Z0-9_]*$/, "Use uppercase letters, numbers, and underscores"),
  ...permissionArrays,
}).superRefine((role, context) => {
  for (const field of Object.keys(permissionArrays) as (keyof typeof permissionArrays)[]) {
    if (role[field].includes("NO_ACCESS") && role[field].length > 1) {
      context.addIssue({ code: "custom", path: [field], message: "No access cannot be combined with other permissions" });
    }
  }
});

export type RoleFormValues = z.infer<typeof roleSchema>;
