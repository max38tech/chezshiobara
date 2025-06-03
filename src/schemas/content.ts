
"use client";

import { z } from "zod";

// --- Rules Page Schemas ---
export const ruleItemSchema = z.object({
  id: z.string().min(1, "ID is required."),
  icon: z.string().min(1, "Icon name is required.").max(50, "Icon name too long."),
  title: z.string().min(3, "Title is required.").max(100, "Title too long."),
  description: z.string().min(10, "Description is required.").max(500, "Description too long."),
});

export type RuleItemFormValues = z.infer<typeof ruleItemSchema>;

export const rulesPageContentFormSchema = z.object({
  rulesList: z.array(ruleItemSchema),
});

export type RulesPageContentFormValues = z.infer<typeof rulesPageContentFormSchema>;

// --- House Guide Page Schemas ---
export const houseGuideItemSchema = z.object({
  id: z.string().min(1, "ID is required."),
  icon: z.string().min(1, "Icon name is required.").max(50, "Icon name too long."),
  title: z.string().min(3, "Title is required.").max(100, "Title too long."),
  content: z.string().min(10, "Content is required.").max(2000, "Content too long."), // Allow more content for guides
});

export type HouseGuideItemFormValues = z.infer<typeof houseGuideItemSchema>;

export const houseGuidePageContentFormSchema = z.object({
  guideItems: z.array(houseGuideItemSchema),
});

export type HouseGuidePageContentFormValues = z.infer<typeof houseGuidePageContentFormSchema>;
