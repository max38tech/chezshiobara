
import { z } from "zod";

export const pricingConfigurationSchema = z.object({
  perNight1Person: z.coerce.number().positive({ message: "Price must be a positive number." }).min(1, "Price must be at least 1."),
  perNight2People: z.coerce.number().positive({ message: "Price must be a positive number." }).min(1, "Price must be at least 1."),
  perWeek1Person: z.coerce.number().positive({ message: "Price must be a positive number." }).min(1, "Price must be at least 1."),
  perWeek2People: z.coerce.number().positive({ message: "Price must be a positive number." }).min(1, "Price must be at least 1."),
  perMonth1Person: z.coerce.number().positive({ message: "Price must be a positive number." }).min(1, "Price must be at least 1."),
  perMonth2People: z.coerce.number().positive({ message: "Price must be a positive number." }).min(1, "Price must be at least 1."),
  // Currency is not directly editable in this form for now
});

export type PricingConfigurationFormValues = z.infer<typeof pricingConfigurationSchema>;
