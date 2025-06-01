
import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters long." }).max(100, { message: "Name cannot exceed 100 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  subject: z.string().max(150, { message: "Subject cannot exceed 150 characters." }).optional(),
  message: z.string().min(10, { message: "Message must be at least 10 characters long." }).max(1000, { message: "Message cannot exceed 1000 characters."}),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
