import { z } from "zod";

export const conciergeRequestSchema = z.object({
  interests: z.string()
    .min(10, { message: "Please describe your interests in at least 10 characters." })
    .max(500, { message: "Interests description cannot exceed 500 characters." }),
  location: z.string()
    .min(2, { message: "Location must be at least 2 characters long." })
    .default("Shiobara, Tochigi, Japan"), // Default location for the B&B
});

export type ConciergeRequestFormValues = z.infer<typeof conciergeRequestSchema>;
