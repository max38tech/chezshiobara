"use server";

import { adminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';

// --- Type Definitions (No Changes Needed) ---
export interface RuleItem { id: string; icon: string; title: string; description: string; }
export interface RulesPageContent { rulesList: RuleItem[]; }
export interface HouseGuideItem { id: string; icon: string; title: string; content: string; }
export interface HouseGuidePageContent { guideItems: HouseGuideItem[]; }
export interface GalleryImageItem { id: string; src: string; alt: string; dataAiHint: string; }
export interface WelcomePageGalleryContent { galleryImages: GalleryImageItem[]; }
export interface LocalTipItem { id: string; title: string; description: string; category: string; imageUrl?: string; imageLinkUrl?: string; }
export interface LocalTipsPageContent { localTips: LocalTipItem[]; }
export interface CommerceDisclosureContent { businessName: string; legalName: string; businessAddress: string; contactEmail: string; contactPhone: string; businessRegistrationInfo: string; descriptionOfGoods: string; transactionCurrencyInfo: string; paymentMethodsInfo: string; refundCancellationPolicy: string; deliveryShippingPolicy: string; privacyPolicySummary: string; termsOfServiceSummary: string; exportRestrictionsInfo: string; customerServiceContactInfo: string; updatedAt?: any; }
export interface PhilosophyItem { id: string; title: string; description: string; }
export interface HeroImage { src: string; alt: string; dataAiHint: string; }
export interface WhoWeArePageContent { pageTitle: string; heroImage: HeroImage; ourStorySection: { title: string; paragraphs: Array<{ id: string; text: string }>; }; ourPhilosophySection: { title: string; introParagraph: string; philosophyItems: PhilosophyItem[]; }; updatedAt?: any; }
export interface WelcomePageTextContent { introParagraph: string; exploreSectionTitle: string; exploreCard1Title: string; exploreCard1Description: string; exploreCard2Title: string; exploreCard2Description: string; exploreCard3Title: string; exploreCard3Description: string; bookingCallToActionParagraph: string; updatedAt?: any; }

// --- Initial Data (No Changes Needed) ---
const initialRulesData: RuleItem[] = [ { id: "checkin-checkout", icon: "Clock", title: "Check-in & Check-out", description: "Check-in is after 3:00 PM. Check-out is before 11:00 AM.", }, { id: "no-smoking", icon: "CigaretteOff", title: "No Smoking", description: "Strictly no smoking inside.", }, { id: "guests-visitors", icon: "Users", title: "Guests & Visitors", description: "Only registered guests are permitted overnight.", }, { id: "quiet-hours", icon: "Volume2", title: "Quiet Hours", description: "Please observe quiet hours from 10:00 PM to 8:00 AM.", }, { id: "pets-policy", icon: "PawPrint", title: "Pets Policy", description: "Unfortunately, we cannot accommodate pets.", }, { id: "amenities-usage", icon: "Waves", title: "Amenities Usage", description: "Please use all amenities responsibly.", }, { id: "no-parties", icon: "PartyPopper", title: "No Parties or Events", description: "Parties or large gatherings are not permitted.", }, ];
const initialHouseGuideData: HouseGuideItem[] = [ { id: "wifi", title: "Wi-Fi Access", icon: "Wifi", content: "Network: ChezShiobara_Guest\nPassword: WelcomeToShiobara", }, { id: "coffee-machine", title: "Coffee Machine", icon: "Coffee", content: "Instructions...", }, { id: "television", title: "Television & Entertainment", icon: "Tv", content: "Instructions...", }, { id: "thermostat", title: "Heating & Air Conditioning", icon: "Thermometer", content: "Instructions...", }, { id: "laundry", title: "Laundry Facilities", icon: "WashingMachine", content: "Instructions...", }, ];
const initialGalleryData: GalleryImageItem[] = [ { id: "gallery_img_1", src: "https://placehold.co/600x400.png", alt: "B&B exterior", dataAiHint: "house exterior" }, { id: "gallery_img_2", src: "https://placehold.co/600x400.png", alt: "Room interior", dataAiHint: "bedroom interior" }, ];
const initialLocalTipsData: LocalTipItem[] = [ { id: uuidv4(), title: "Gora Brewery & Grill", description: "Enjoy craft beers and delicious grilled food.", category: "Dining" }, { id: uuidv4(), title: "Hakone Open-Air Museum", description: "Explore stunning contemporary sculptures.", category: "Sightseeing" }, ];
const initialCommerceDisclosureData: CommerceDisclosureContent = { businessName: "Chez Shiobara B&B", legalName: "Shawn Shiobara", businessAddress: "16-7 Karasawa, Minami-ku\nYokohama, Kanagawa 232-0034\nJapan", contactEmail: "us@shiobara.love", contactPhone: "+81 070 9058 2258", businessRegistrationInfo: "Details...", descriptionOfGoods: "Accommodation services.", transactionCurrencyInfo: "All transactions are in USD.", paymentMethodsInfo: "Credit/Debit Cards via Stripe.", refundCancellationPolicy: "Please review the cancellation policy during booking.", deliveryShippingPolicy: "Not applicable.", privacyPolicySummary: "We respect your privacy. We do not sell your data.", termsOfServiceSummary: "By booking, you agree to our house rules.", exportRestrictionsInfo: "Not applicable.", customerServiceContactInfo: "Email: us@shiobara.love\nPhone: +81 070 9058 2258" };
const initialWhoWeAreData: WhoWeArePageContent = { pageTitle: "Meet Your Hosts", heroImage: { src: "https://placehold.co/600x750.png", alt: "Hosts", dataAiHint: "friendly couple" }, ourStorySection: { title: "Our Story", paragraphs: [ { id: uuidv4(), text: "Welcome to Chez Shiobara! We are Shino and Shawn..." } ] }, ourPhilosophySection: { title: "Our Philosophy", introParagraph: "We believe in:", philosophyItems: [ { id: uuidv4(), title: "Genuine Hospitality", description: "Making you feel truly welcome." } ] } };
const initialWelcomePageTextData: WelcomePageTextContent = { introParagraph: "Discover a hidden gem nestled in Yokohama...", exploreSectionTitle: "Explore Our B&B", exploreCard1Title: "Comfortable Guest Room", exploreCard1Description: "Unwind in our bright and comfortable guest room...", exploreCard2Title: "Explore the Region", exploreCard2Description: "Discover the vibrant culture...", exploreCard3Title: "Warm Hospitality", exploreCard3Description: "As your hosts, Shino and Shawn are dedicated...", bookingCallToActionParagraph: "Ready to experience the charm of Chez Shiobara?" };

// --- Rules Page Functions ---

export async function getRulesPageContent(): Promise<RulesPageContent> {
  try {
    const docRef = adminDb.collection("siteContent").doc("rulesPage");
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return docSnap.data() as RulesPageContent;
    } else {
      await docRef.set({ rulesList: initialRulesData });
      return { rulesList: initialRulesData };
    }
  } catch (error) {
    console.error("Error fetching rules content:", error);
    return { rulesList: initialRulesData }; 
  }
}

export async function updateRulesPageContent(newRules: RuleItem[]): Promise<{ success: boolean; message: string }> {
  try {
    const docRef = adminDb.collection("siteContent").doc("rulesPage");
    await docRef.set({ rulesList: newRules });
    revalidatePath('/rules'); // Refreshes the cache for the rules page
    return { success: true, message: "House rules updated successfully." };
  } catch (error) {
    return { success: false, message: "Failed to update house rules." };
  }
}

// --- House Guide Functions ---

export async function getHouseGuideContent(): Promise<HouseGuidePageContent> {
  try {
    const docRef = adminDb.collection("siteContent").doc("houseGuidePage");
    const docSnap = await docRef.get();

    if (docSnap.exists()) {
      return docSnap.data() as HouseGuidePageContent;
    } else {
      await docRef.set({ guideItems: initialHouseGuideData });
      return { guideItems: initialHouseGuideData };
    }
  } catch (error) {
    console.error("Error fetching house guide content:", error);
    return { guideItems: initialHouseGuideData };
  }
}

export async function updateHouseGuideContent(newItems: HouseGuideItem[]): Promise<{ success: boolean; message: string }> {
  try {
    const docRef = adminDb.collection("siteContent").doc("houseGuidePage");
    await docRef.set({ guideItems: newItems });
    revalidatePath('/house-guide');
    return { success: true, message: "House guide updated successfully." };
  } catch (error) {
    return { success: false, message: "Failed to update house guide." };
  }
}

// --- Welcome Page Gallery Functions ---

export async function getWelcomePageGalleryContent(): Promise<WelcomePageGalleryContent> {
  try {
    const docRef = adminDb.collection("siteContent").doc("welcomePageGallery");
    const docSnap = await docRef.get();

    if (docSnap.exists()) {
      return docSnap.data() as WelcomePageGalleryContent;
    } else {
      await docRef.set({ galleryImages: initialGalleryData });
      return { galleryImages: initialGalleryData };
    }
  } catch (error) {
    console.error("Error fetching welcome gallery content:", error);
    return { galleryImages: initialGalleryData };
  }
}

export async function updateWelcomePageGalleryContent(newImages: GalleryImageItem[]): Promise<{ success: boolean; message: string }> {
  try {
    const docRef = adminDb.collection("siteContent").doc("welcomePageGallery");
    await docRef.set({ galleryImages: newImages });
    revalidatePath('/');
    return { success: true, message: "Welcome gallery updated successfully." };
  } catch (error) {
    return { success: false, message: "Failed to update welcome gallery." };
  }
}

// --- Local Tips Functions ---

export async function getLocalTipsPageContent(): Promise<LocalTipsPageContent> {
  try {
    const docRef = adminDb.collection("siteContent").doc("localTipsPage");
    const docSnap = await docRef.get();
    if (docSnap.exists()) {
      return docSnap.data() as LocalTipsPageContent;
    } else {
      await docRef.set({ localTips: initialLocalTipsData });
      return { localTips: initialLocalTipsData };
    }
  } catch (error) {
    console.error("Error fetching local tips:", error);
    return { localTips: initialLocalTipsData };
  }
}

export async function updateLocalTipsPageContent(newTips: LocalTipItem[]): Promise<{ success: boolean; message: string }> {
  try {
    const docRef = adminDb.collection("siteContent").doc("localTipsPage");
    await docRef.set({ localTips: newTips });
    revalidatePath('/local-tips');
    return { success: true, message: "Local tips updated successfully." };
  } catch (error) {
    return { success: false, message: "Failed to update local tips." };
  }
}

// --- Commerce Disclosure Functions ---

export async function getCommerceDisclosureContent(): Promise<CommerceDisclosureContent> {
  try {
    const docRef = adminDb.collection("siteContent").doc("commerceDisclosurePage");
    const docSnap = await docRef.get();
    if (docSnap.exists()) {
      const data = docSnap.data()!;
      // Convert Timestamp to Date if it exists
      if (data.updatedAt) {
        data.updatedAt = (data.updatedAt as Timestamp).toDate();
      }
      return data as CommerceDisclosureContent;
    } else {
      await docRef.set({ ...initialCommerceDisclosureData, updatedAt: FieldValue.serverTimestamp() });
      return { ...initialCommerceDisclosureData, updatedAt: new Date() };
    }
  } catch (error) {
    console.error("Error fetching commerce disclosure:", error);
    return { ...initialCommerceDisclosureData, updatedAt: new Date() };
  }
}

export async function updateCommerceDisclosureContent(newContent: Omit<CommerceDisclosureContent, 'updatedAt'>): Promise<{ success: boolean; message:string }> {
  try {
    const docRef = adminDb.collection("siteContent").doc("commerceDisclosurePage");
    await docRef.set({ ...newContent, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    revalidatePath('/commerce-disclosure');

    return { success: true, message: "Commerce Disclosure content updated successfully." };
  } catch (error) {
    return { success: false, message: "Failed to update Commerce Disclosure content." };
  }
}

// --- Who We Are Page Functions ---

export async function getWhoWeArePageContent(): Promise<WhoWeArePageContent> {
  try {
    const docRef = adminDb.collection("siteContent").doc("whoWeArePage");
    const docSnap = await docRef.get();
    if (docSnap.exists()) {
        const data = docSnap.data()!;
        if (data.updatedAt) data.updatedAt = (data.updatedAt as Timestamp).toDate();
        return data as WhoWeArePageContent;
    } else {
        await docRef.set({ ...initialWhoWeAreData, updatedAt: FieldValue.serverTimestamp() });
        return { ...initialWhoWeAreData, updatedAt: new Date() };
    }
  } catch (error) {
    console.error("Error fetching who we are content:", error);
    return { ...initialWhoWeAreData, updatedAt: new Date() };
  }
}

export async function updateWhoWeArePageContent(newContent: Omit<WhoWeArePageContent, 'updatedAt'>): Promise<{ success: boolean; message: string }> {
    try {
        const docRef = adminDb.collection("siteContent").doc("whoWeArePage");
        await docRef.set({ ...newContent, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
        revalidatePath('/about-us');
        return { success: true, message: "'Who We Are' page content updated successfully." };
    } catch (error) {
        return { success: false, message: "Failed to update 'Who We Are' page content." };
    }
}

// --- Welcome Page Text Functions ---

export async function getWelcomePageTextContent(): Promise<WelcomePageTextContent> {
  try {
    const docRef = adminDb.collection("siteContent").doc("welcomePageText");
    const docSnap = await docRef.get();
    if (docSnap.exists()) {
        const data = docSnap.data()!;
        if (data.updatedAt) data.updatedAt = (data.updatedAt as Timestamp).toDate();
        return data as WelcomePageTextContent;
    } else {
        await docRef.set({ ...initialWelcomePageTextData, updatedAt: FieldValue.serverTimestamp() });
        return { ...initialWelcomePageTextData, updatedAt: new Date() };
    }
  } catch (error) {
    console.error("Error fetching welcome text content:", error);
    return { ...initialWelcomePageTextData, updatedAt: new Date() };
  }
}

export async function updateWelcomePageTextContent(newContent: Omit<WelcomePageTextContent, 'updatedAt'>): Promise<{ success: boolean; message: string }> {
    try {
        const docRef = adminDb.collection("siteContent").doc("welcomePageText");
        await docRef.set({ ...newContent, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
        revalidatePath('/');
        return { success: true, message: "Welcome page text content updated successfully." };
    } catch (error) {
        return { success: false, message: "Failed to update welcome page text content." };
    }
}