"use server";

import { adminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
// import { revalidatePath } from 'next/cache'; // We are commenting this out temporarily
import { v4 as uuidv4 } from 'uuid';

// --- Type Definitions (No Changes) ---
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
export interface BookingConfirmationEmailContent { subject: string; body: string; updatedAt?: any; }

// --- Initial Data (No Changes) ---
const initialRulesData: RuleItem[] = [ { id: "checkin-checkout", icon: "Clock", title: "Check-in & Check-out", description: "Check-in is after 3:00 PM. Check-out is before 11:00 AM.", }, { id: "no-smoking", icon: "CigaretteOff", title: "No Smoking", description: "Strictly no smoking inside.", }, { id: "guests-visitors", icon: "Users", title: "Guests & Visitors", description: "Only registered guests are permitted overnight.", }, { id: "quiet-hours", icon: "Volume2", title: "Quiet Hours", description: "Please observe quiet hours from 10:00 PM to 8:00 AM.", }, { id: "pets-policy", icon: "PawPrint", title: "Pets Policy", description: "Unfortunately, we cannot accommodate pets.", }, { id: "amenities-usage", icon: "Waves", title: "Amenities Usage", description: "Please use all amenities responsibly.", }, { id: "no-parties", icon: "PartyPopper", title: "No Parties or Events", description: "Parties or large gatherings are not permitted.", }, ];
const initialHouseGuideData: HouseGuideItem[] = [ { id: "wifi", title: "Wi-Fi Access", icon: "Wifi", content: "Network: ChezShiobara_Guest\nPassword: WelcomeToShiobara", }, { id: "coffee-machine", title: "Coffee Machine", icon: "Coffee", content: "Instructions...", }, { id: "television", title: "Television & Entertainment", icon: "Tv", content: "Instructions...", }, { id: "thermostat", title: "Heating & Air Conditioning", icon: "Thermometer", content: "Instructions...", }, { id: "laundry", title: "Laundry Facilities", icon: "WashingMachine", content: "Instructions...", }, ];
const initialGalleryData: GalleryImageItem[] = [ { id: "gallery_img_1", src: "https://placehold.co/600x400.png", alt: "B&B exterior", dataAiHint: "house exterior" }, { id: "gallery_img_2", src: "https://placehold.co/600x400.png", alt: "Room interior", dataAiHint: "bedroom interior" }, ];
const initialLocalTipsData: LocalTipItem[] = [ { id: uuidv4(), title: "Gora Brewery & Grill", description: "Enjoy craft beers and delicious grilled food.", category: "Dining" }, { id: uuidv4(), title: "Hakone Open-Air Museum", description: "Explore stunning contemporary sculptures.", category: "Sightseeing" }, ];
const initialCommerceDisclosureData: CommerceDisclosureContent = { businessName: "Chez Shiobara B&B", legalName: "Shawn Shiobara", businessAddress: "16-7 Karasawa, Minami-ku\nYokohama, Kanagawa 232-0034\nJapan", contactEmail: "us@shiobara.love", contactPhone: "+81 070 9058 2258", businessRegistrationInfo: "Details...", descriptionOfGoods: "Accommodation services.", transactionCurrencyInfo: "All transactions are in USD.", paymentMethodsInfo: "Credit/Debit Cards via Stripe.", refundCancellationPolicy: "Please review the cancellation policy during booking.", deliveryShippingPolicy: "Not applicable.", privacyPolicySummary: "We respect your privacy. We do not sell your data.", termsOfServiceSummary: "By booking, you agree to our house rules.", exportRestrictionsInfo: "Not applicable.", customerServiceContactInfo: "Email: us@shiobara.love\nPhone: +81 070 9058 2258" };
const initialWhoWeAreData: WhoWeArePageContent = { pageTitle: "Meet Your Hosts", heroImage: { src: "https://placehold.co/600x750.png", alt: "Hosts", dataAiHint: "friendly couple" }, ourStorySection: { title: "Our Story", paragraphs: [ { id: uuidv4(), text: "Welcome to Chez Shiobara! We are Shino and Shawn..." } ] }, ourPhilosophySection: { title: "Our Philosophy", introParagraph: "We believe in:", philosophyItems: [ { id: uuidv4(), title: "Genuine Hospitality", description: "Making you feel truly welcome." } ] } };
const initialWelcomePageTextData: WelcomePageTextContent = { introParagraph: "Discover a hidden gem nestled in Yokohama...", exploreSectionTitle: "Explore Our B&B", exploreCard1Title: "Comfortable Guest Room", exploreCard1Description: "Unwind in our bright and comfortable guest room...", exploreCard2Title: "Explore the Region", exploreCard2Description: "Discover the vibrant culture...", exploreCard3Title: "Warm Hospitality", exploreCard3Description: "As your hosts, Shino and Shawn are dedicated...", bookingCallToActionParagraph: "Ready to experience the charm of Chez Shiobara?" };
const initialBookingConfirmationEmailData: BookingConfirmationEmailContent = {
  subject: "Booking Confirmation & Payment - Chez Shiobara (ID: {{bookingId}})",
  body: `
<div>
  <h2>Booking Confirmed</h2>
  <p>Dear {{name}},</p>
  <p>Thank you for your booking! Your stay at Chez Shiobara is confirmed.</p>
  
  <div>
    <h3>Booking Summary:</h3>
    <ul>
      <li>Name: {{name}}</li>
      <li>Check-in: {{checkInDate}}</li>
      <li>Check-out: {{checkOutDate}}</li>
      <li>Guests: {{guests}}</li>
      <li>Total Amount: {{totalAmount}}</li>
    </ul>
  </div>

  <div>
    <h3>Payment Instructions:</h3>
    <p>A payment of {{totalAmount}} is due to finalize your booking. Please use one of the following options:</p>
    <ul>
      <li><a href="YOUR_STRIPE_LINK_HERE">Pay with Credit Card (via Stripe)</a></li>
      <li><a href="YOUR_PAYPAL_LINK_HERE">Pay with PayPal</a></li>
      <li><strong>Wise Transfer:</strong> Please send the payment to our email address: us@shiobara.love</li>
    </ul>
    <p>If you have any questions, please don't hesitate to contact us.</p>
  </div>

  <p>We look forward to welcoming you!</p>
  <p>Sincerely,<br>Shino & Shawn<br>Chez Shiobara</p>
</div>
  `
};

// --- Rules Page Functions ---

export async function getRulesPageContent(): Promise<RulesPageContent> {
  if (!adminDb) {
    console.error("Firebase Admin is not initialized. Serving initial data.");
    return { rulesList: initialRulesData };
  }
  try {
    const docRef = adminDb.collection("siteContent").doc("rulesPage");
    const docSnap = await docRef.get();
    if (docSnap.exists) return docSnap.data() as RulesPageContent;
    
    await docRef.set({ rulesList: initialRulesData });
    return { rulesList: initialRulesData };
  } catch (error) {
    console.error("Error fetching rules content:", error);
    return { rulesList: initialRulesData }; 
  }
}

export async function updateRulesPageContent(newRules: RuleItem[]): Promise<{ success: boolean; message: string }> {
  if (!adminDb) {
    console.error("Firebase Admin is not initialized. Cannot update content.");
    return { success: false, message: "Database connection not available." };
  }
  try {
    const docRef = adminDb.collection("siteContent").doc("rulesPage");
    await docRef.set({ rulesList: newRules });
    // revalidatePath('/rules'); // 🎯 Temporarily commented out to resolve the error
    return { success: true, message: "House rules updated successfully." };
  } catch (error) {
    return { success: false, message: "Failed to update house rules." };
  }
}

// --- House Guide Functions ---

export async function getHouseGuideContent(): Promise<HouseGuidePageContent> {
  if (!adminDb) {
    console.error("Firebase Admin is not initialized. Serving initial data.");
    return { guideItems: initialHouseGuideData };
  }
  try {
    const docRef = adminDb.collection("siteContent").doc("houseGuidePage");
    const docSnap = await docRef.get();
    if (docSnap.exists) return docSnap.data() as HouseGuidePageContent;

    await docRef.set({ guideItems: initialHouseGuideData });
    return { guideItems: initialHouseGuideData };
  } catch (error) {
    console.error("Error fetching house guide content:", error);
    return { guideItems: initialHouseGuideData };
  }
}

export async function updateHouseGuideContent(newItems: HouseGuideItem[]): Promise<{ success: boolean; message: string }> {
  if (!adminDb) {
    console.error("Firebase Admin is not initialized. Cannot update content.");
    return { success: false, message: "Database connection not available." };
  }
  try {
    const docRef = adminDb.collection("siteContent").doc("houseGuidePage");
    await docRef.set({ guideItems: newItems });
    // revalidatePath('/house-guide'); // 🎯 Temporarily commented out
    return { success: true, message: "House guide updated successfully." };
  } catch (error) {
    return { success: false, message: "Failed to update house guide." };
  }
}

// --- Welcome Page Gallery Functions ---

export async function getWelcomePageGalleryContent(): Promise<WelcomePageGalleryContent> {
  if (!adminDb) {
    console.error("Firebase Admin is not initialized. Serving initial data.");
    return { galleryImages: initialGalleryData };
  }
  try {
    const docRef = adminDb.collection("siteContent").doc("welcomePageGallery");
    const docSnap = await docRef.get();
    if (docSnap.exists) return docSnap.data() as WelcomePageGalleryContent;
    
    await docRef.set({ galleryImages: initialGalleryData });
    return { galleryImages: initialGalleryData };
  } catch (error) {
    console.error("Error fetching welcome gallery content:", error);
    return { galleryImages: initialGalleryData };
  }
}

export async function updateWelcomePageGalleryContent(newImages: GalleryImageItem[]): Promise<{ success: boolean; message: string }> {
  if (!adminDb) {
    console.error("Firebase Admin is not initialized. Cannot update content.");
    return { success: false, message: "Database connection not available." };
  }
  try {
    const docRef = adminDb.collection("siteContent").doc("welcomePageGallery");
    await docRef.set({ galleryImages: newImages });
    // revalidatePath('/'); // 🎯 Temporarily commented out
    return { success: true, message: "Gallery content updated successfully." };
  } catch (error) {
    console.error("Error updating welcome gallery content:", error);
    return { success: false, message: "Failed to update gallery content." };
  }
}

// --- Local Tips Functions ---

export async function getLocalTipsPageContent(): Promise<LocalTipsPageContent> {
  if (!adminDb) {
    console.error("Firebase Admin is not initialized. Serving initial data.");
    return { localTips: initialLocalTipsData };
  }
  try {
    const docRef = adminDb.collection("siteContent").doc("localTipsPage");
    const docSnap = await docRef.get();
    if (docSnap.exists) return docSnap.data() as LocalTipsPageContent;

    await docRef.set({ localTips: initialLocalTipsData });
    return { localTips: initialLocalTipsData };
  } catch (error) {
    console.error("Error fetching local tips content:", error);
    return { localTips: initialLocalTipsData };
  }
}

export async function updateLocalTipsPageContent(newTips: LocalTipItem[]): Promise<{ success: boolean; message: string }> {
  if (!adminDb) {
    console.error("Firebase Admin is not initialized. Cannot update content.");
    return { success: false, message: "Database connection not available." };
  }
  try {
    const docRef = adminDb.collection("siteContent").doc("localTipsPage");
    await docRef.set({ localTips: newTips });
    // revalidatePath('/local-tips'); // 🎯 Temporarily commented out
    return { success: true, message: "Local tips updated successfully." };
  } catch (error) {
    console.error("Error updating local tips:", error);
    return { success: false, message: "Failed to update local tips." };
  }
}

// --- Commerce Disclosure Functions ---

export async function getCommerceDisclosureContent(): Promise<CommerceDisclosureContent> {
  if (!adminDb) {
    console.error("Firebase Admin is not initialized. Serving initial data.");
    return initialCommerceDisclosureData;
  }
  try {
    const docRef = adminDb.collection("siteContent").doc("commerceDisclosure");
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      const data = docSnap.data();
      return {
        ...data,
        updatedAt: data?.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : null,
      } as CommerceDisclosureContent;
    }
    
    await docRef.set({ ...initialCommerceDisclosureData, updatedAt: FieldValue.serverTimestamp() });
    return initialCommerceDisclosureData;
  } catch (error) {
    console.error("Error fetching commerce disclosure content:", error);
    return initialCommerceDisclosureData;
  }
}

export async function updateCommerceDisclosureContent(content: CommerceDisclosureContent): Promise<{ success: boolean; message: string }> {
  if (!adminDb) {
    console.error("Firebase Admin is not initialized. Cannot update content.");
    return { success: false, message: "Database connection not available." };
  }
  try {
    const docRef = adminDb.collection("siteContent").doc("commerceDisclosure");
    await docRef.set({ ...content, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    // revalidatePath('/commerce-disclosure'); // 🎯 Temporarily commented out
    return { success: true, message: "Commerce disclosure updated successfully." };
  } catch (error) {
    console.error("Error updating commerce disclosure:", error);
    return { success: false, message: "Failed to update commerce disclosure." };
  }
}

// --- Who We Are Page Functions ---

export async function getWhoWeArePageContent(): Promise<WhoWeArePageContent> {
  if (!adminDb) {
    console.error("Firebase Admin is not initialized. Serving initial data.");
    return initialWhoWeAreData;
  }
  try {
    const docRef = adminDb.collection("siteContent").doc("whoWeArePage");
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      const data = docSnap.data() as WhoWeArePageContent;
      return {
        ...data,
        updatedAt: (data.updatedAt as any)?.toDate ? (data.updatedAt as any).toDate().toISOString() : null,
      };
    }
    
    await docRef.set({ ...initialWhoWeAreData, updatedAt: FieldValue.serverTimestamp() });
    return initialWhoWeAreData;
  } catch (error) {
    console.error("Error fetching 'Who We Are' content:", error);
    return initialWhoWeAreData;
  }
}

export async function updateWhoWeArePageContent(content: WhoWeArePageContent): Promise<{ success: boolean; message: string }> {
  if (!adminDb) {
    console.error("Firebase Admin is not initialized. Cannot update content.");
    return { success: false, message: "Database connection not available." };
  }
  try {
    const docRef = adminDb.collection("siteContent").doc("whoWeArePage");
    await docRef.set({ ...content, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    // revalidatePath('/who-we-are'); // 🎯 Temporarily commented out
    return { success: true, message: "'Who We Are' page updated successfully." };
  } catch (error) {
    console.error("Error updating 'Who We Are' content:", error);
    return { success: false, message: "Failed to update 'Who We Are' page." };
  }
}

// --- Welcome Page Text Content Functions ---

export async function getWelcomePageTextContent(): Promise<WelcomePageTextContent> {
  if (!adminDb) {
    console.error("Firebase Admin is not initialized. Serving initial data.");
    return initialWelcomePageTextData;
  }
  try {
    const docRef = adminDb.collection("siteContent").doc("welcomePageText");
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      const data = docSnap.data() as WelcomePageTextContent;
      return {
        ...data,
        updatedAt: (data.updatedAt as any)?.toDate ? (data.updatedAt as any).toDate().toISOString() : null,
      };
    }
    
    await docRef.set({ ...initialWelcomePageTextData, updatedAt: FieldValue.serverTimestamp() });
    return initialWelcomePageTextData;
  } catch (error) {
    console.error("Error fetching welcome page text content:", error);
    return initialWelcomePageTextData;
  }
}

export async function updateWelcomePageTextContent(content: WelcomePageTextContent): Promise<{ success: boolean; message: string }> {
  if (!adminDb) {
    console.error("Firebase Admin is not initialized. Cannot update content.");
    return { success: false, message: "Database connection not available." };
  }
  try {
    const docRef = adminDb.collection("siteContent").doc("welcomePageText");
    await docRef.set({ ...content, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    // revalidatePath('/'); // 🎯 Temporarily commented out
    return { success: true, message: "Welcome page text content updated successfully." };
  } catch (error) {
    console.error("Error updating welcome page text content:", error);
    return { success: false, message: "Failed to update welcome page text content." };
  }
}

// --- Booking Confirmation Email Functions ---

export async function getBookingConfirmationEmailContent(): Promise<BookingConfirmationEmailContent> {
  if (!adminDb) {
    console.error("Firebase Admin is not initialized. Serving initial data.");
    return initialBookingConfirmationEmailData;
  }
  try {
    const docRef = adminDb.collection("siteContent").doc("bookingConfirmationEmail");
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      const data = docSnap.data() as BookingConfirmationEmailContent;
      return {
        ...data,
        updatedAt: (data.updatedAt as any)?.toDate ? (data.updatedAt as any).toDate().toISOString() : null,
      };
    }
    
    await docRef.set({ ...initialBookingConfirmationEmailData, updatedAt: FieldValue.serverTimestamp() });
    return initialBookingConfirmationEmailData;
  } catch (error) {
    console.error("Error fetching booking confirmation email content:", error);
    return initialBookingConfirmationEmailData;
  }
}

export async function updateBookingConfirmationEmailContent(content: BookingConfirmationEmailContent): Promise<{ success: boolean; message: string }> {
  if (!adminDb) {
    console.error("Firebase Admin is not initialized. Cannot update content.");
    return { success: false, message: "Database connection not available." };
  }
  try {
    const docRef = adminDb.collection("siteContent").doc("bookingConfirmationEmail");
    await docRef.set({ ...content, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    // revalidatePath('/admin/content/booking-email'); // 🎯 We will create this page
    return { success: true, message: "Booking confirmation email template updated successfully." };
  } catch (error) {
    console.error("Error updating booking confirmation email content:", error);
    return { success: false, message: "Failed to update booking confirmation email content." };
  }
}