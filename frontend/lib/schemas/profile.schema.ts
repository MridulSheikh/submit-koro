import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be 100 characters or fewer"),
  image: z.union([
    z.literal(""),
    z.url("Enter a valid image URL"),
  ]),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
