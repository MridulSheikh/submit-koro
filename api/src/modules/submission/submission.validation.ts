import { z } from "zod";

const submissionStatusSchema = z.enum([
  "PENDING",
  "IN_REVIEW",
  "REVIEWED",
  "APPROVED",
  "REJECTED",
]);
const submissionSortFields = ["createdAt", "projectName", "status"] as const;
const submissionSortFieldSet = new Set<string>(submissionSortFields);
const submissionSortSchema = z
  .string()
  .trim()
  .min(1)
  .refine(
    (sort) =>
      sort.split(",").every((item) => {
        const field = item.trim().replace(/^-/, "");
        return submissionSortFieldSet.has(field);
      }),
    "Unsupported submission sort field",
  );

const submissionFieldsSchema = z.object({
  projectName: z.string().trim().min(1, "Project name is required"),
  description: z.string().trim().nullable().optional(),
  liveUrl: z.string().trim().url("Enter a valid live URL"),
  repositoryUrl: z.string().trim().url("Enter a valid repository URL"),
});

export const createSubmissionSchema = z
  .object({
    body: submissionFieldsSchema.strict(),
  });

export const updateSubmissionSchema = z
  .object({
    body: submissionFieldsSchema
      .partial()
      .extend({
        status: submissionStatusSchema.optional(),
      })
      .strict()
      .refine((body) => Object.keys(body).length > 0, {
        message: "Provide at least one field to update",
      }),
  });

export const submissionIdSchema = z
  .object({
    params: z.object({ id: z.string().uuid() }).strict(),
  });

export const getAllSubmissionsQuerySchema = z
  .object({
    search: z.string().trim().min(1).optional(),
    status: submissionStatusSchema.optional(),
    sort: submissionSortSchema.optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
  })
  .strict();

export type GetAllSubmissionsQuery = z.infer<
  typeof getAllSubmissionsQuerySchema
>;
