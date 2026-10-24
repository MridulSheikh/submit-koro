import { z } from "zod";

const reviewFieldsSchema = z.object({
  score: z.number().finite().nullable().optional(),
  feedback: z.string().trim().min(1, "Feedback is required"),
});

export const createReviewSchema = z.object({
  body: reviewFieldsSchema
    .extend({
      submissionId: z.string().uuid("Invalid submission ID"),
      reviewerId: z.string().uuid("Invalid submission ID")
    })
    .strict(),
});

export const updateReviewSchema = z.object({
  body: reviewFieldsSchema
    .partial()
    .strict()
    .refine((body) => Object.keys(body).length > 0, {
      message: "Provide at least one field to update",
    }),
});