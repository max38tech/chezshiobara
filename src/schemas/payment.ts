
"use client";

import { z } from "zod";

export const paymentSettingsSchema = z.object({
  paypalEmailOrLink: z.string().max(200, "PayPal detail too long.").optional().or(z.literal('')),
  isPaypalEnabled: z.boolean().default(false),
  wiseInstructions: z.string().max(1000, "Wise instructions too long.").optional().or(z.literal('')),
  isWiseEnabled: z.boolean().default(false),
  cardPaymentInstructions: z.string().max(1000, "Card payment instructions too long.").optional().or(z.literal('')),
  isCardPaymentEnabled: z.boolean().default(false),
});

export type PaymentSettingsFormValues = z.infer<typeof paymentSettingsSchema>;
