
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
  content: z.string().min(10, "Content is required.").max(2000, "Content too long."),
});

export type HouseGuideItemFormValues = z.infer<typeof houseGuideItemSchema>;

export const houseGuidePageContentFormSchema = z.object({
  guideItems: z.array(houseGuideItemSchema),
});

export type HouseGuidePageContentFormValues = z.infer<typeof houseGuidePageContentFormSchema>;

// --- Welcome Page Gallery Schemas ---
export const galleryImageItemSchema = z.object({
  id: z.string().min(1, "ID is required."),
  src: z.string().url({ message: "Please enter a valid URL." }).min(1, "Image URL is required."),
  alt: z.string().min(3, "Alt text is required.").max(150, "Alt text too long."),
  dataAiHint: z.string().min(1, "AI hint is required.").max(50, "AI hint too long (max 2 words recommended)."),
});

export type GalleryImageItemFormValues = z.infer<typeof galleryImageItemSchema>;

export const welcomePageGalleryContentFormSchema = z.object({
  galleryImages: z.array(galleryImageItemSchema),
});

export type WelcomePageGalleryContentFormValues = z.infer<typeof welcomePageGalleryContentFormSchema>;

// --- Local Tips Page Schemas ---
export const localTipItemSchema = z.object({
  id: z.string().min(1, "ID is required."),
  title: z.string().min(3, "Title is required.").max(150, "Title too long."),
  description: z.string().min(10, "Description is required.").max(1000, "Description too long."),
  category: z.string().min(1, "Category is required.").max(50, "Category too long."),
  imageUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  dataAiHint: z.string().max(50, "AI hint too long (max 2 words recommended).").optional().or(z.literal('')),
});

export type LocalTipItemFormValues = z.infer<typeof localTipItemSchema>;

export const localTipsPageContentFormSchema = z.object({
  localTips: z.array(localTipItemSchema),
});

export type LocalTipsPageContentFormValues = z.infer<typeof localTipsPageContentFormSchema>;


// --- Commerce Disclosure Page Schemas ---
export const commerceDisclosureContentSchema = z.object({
  businessName: z.string().min(1, "Business name is required.").max(150),
  businessAddress: z.string().min(1, "Business address is required.").max(500),
  contactEmail: z.string().email("Invalid email address.").max(100),
  contactPhone: z.string().min(1, "Contact phone is required.").max(50),
  businessRegistrationInfo: z.string().min(1, "Business registration info is required.").max(1000),
  descriptionOfGoods: z.string().min(1, "Description of goods/services is required.").max(2000),
  transactionCurrencyInfo: z.string().min(1, "Transaction currency info is required.").max(500),
  paymentMethodsInfo: z.string().min(1, "Payment methods info is required.").max(1000),
  refundCancellationPolicy: z.string().min(1, "Refund/Cancellation policy is required.").max(5000),
  deliveryShippingPolicy: z.string().min(1, "Delivery/Shipping policy is required.").max(1000),
  privacyPolicySummary: z.string().min(1, "Privacy policy summary is required.").max(3000),
  termsOfServiceSummary: z.string().min(1, "Terms of service summary is required.").max(3000),
  exportRestrictionsInfo: z.string().min(1, "Export restrictions info is required.").max(500),
  customerServiceContactInfo: z.string().min(1, "Customer service contact info is required.").max(1000),
});

export type CommerceDisclosureContentFormValues = z.infer<typeof commerceDisclosureContentSchema>;

