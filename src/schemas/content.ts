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
  imageLinkUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
});

export type LocalTipItemFormValues = z.infer<typeof localTipItemSchema>;

export const localTipsPageContentFormSchema = z.object({
  localTips: z.array(localTipItemSchema),
});

export type LocalTipsPageContentFormValues = z.infer<typeof localTipsPageContentFormSchema>;


// --- Commerce Disclosure Page Schemas ---
export const commerceDisclosureContentSchema = z.object({
  businessName: z.string().min(1, "Business name is required.").max(150),
  legalName: z.string().min(1, "Legal name is required.").max(150),
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

// --- Who We Are Page Schemas ---
export const heroImageSchema = z.object({
  src: z.string().url({ message: "Please enter a valid URL or upload an image." }).min(1, "Hero image URL is required."),
  alt: z.string().min(3, "Alt text is required.").max(150, "Alt text too long."),
  dataAiHint: z.string().min(1, "AI hint is required.").max(50, "AI hint too long."),
});

export const storyParagraphSchema = z.object({
  id: z.string().min(1, "Paragraph ID is required."),
  text: z.string().min(10, "Paragraph text is required.").max(2000, "Paragraph too long."),
});

export const philosophyItemSchema = z.object({
  id: z.string().min(1, "Philosophy item ID is required."),
  title: z.string().min(3, "Philosophy title is required.").max(100, "Title too long."),
  description: z.string().min(10, "Philosophy description is required.").max(500, "Description too long."),
});

export const whoWeArePageContentSchema = z.object({
  pageTitle: z.string().min(3, "Page title is required.").max(100, "Page title too long."),
  heroImage: heroImageSchema,
  ourStorySection: z.object({
    title: z.string().min(3, "Story section title is required.").max(100, "Title too long."),
    paragraphs: z.array(storyParagraphSchema).min(1, "At least one story paragraph is required."),
  }),
  ourPhilosophySection: z.object({
    title: z.string().min(3, "Philosophy section title is required.").max(100, "Title too long."),
    introParagraph: z.string().min(10, "Philosophy intro is required.").max(1000, "Intro too long."),
    philosophyItems: z.array(philosophyItemSchema).min(1, "At least one philosophy item is required."),
  }),
});

export type WhoWeArePageContentFormValues = z.infer<typeof whoWeArePageContentSchema>;

// --- Welcome Page Text Content Schemas ---
export const welcomePageTextContentSchema = z.object({
  introParagraph: z.string().min(20, "Intro paragraph is too short.").max(1000, "Intro paragraph is too long."),
  exploreSectionTitle: z.string().min(5, "Explore section title is too short.").max(100, "Explore section title is too long."),
  exploreCard1Title: z.string().min(5, "Card 1 title is too short.").max(100, "Card 1 title is too long."),
  exploreCard1Description: z.string().min(10, "Card 1 description is too short.").max(1000, "Card 1 description is too long."), // Increased limit
  exploreCard2Title: z.string().min(5, "Card 2 title is too short.").max(100, "Card 2 title is too long."),
  exploreCard2Description: z.string().min(10, "Card 2 description is too short.").max(500, "Card 2 description is too long."),
  exploreCard3Title: z.string().min(5, "Card 3 title is too short.").max(100, "Card 3 title is too long."),
  exploreCard3Description: z.string().min(10, "Card 3 description is too short.").max(500, "Card 3 description is too long."),
  bookingCallToActionParagraph: z.string().min(10, "Call to action text is too short.").max(200, "Call to action text is too long."),
});

export type WelcomePageTextContentFormValues = z.infer<typeof welcomePageTextContentSchema>;
