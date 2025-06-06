
"use server";

import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import type { LucideIcon } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';

// --- Rules Page Content ---
export interface RuleItem {
  id: string;
  icon: string; // Name of the lucide icon
  title: string;
  description: string;
}

export interface RulesPageContent {
  rulesList: RuleItem[];
}

const initialRulesData: RuleItem[] = [
  {
    id: "checkin-checkout",
    icon: "Clock",
    title: "Check-in & Check-out",
    description: "Check-in is after 3:00 PM. Check-out is before 11:00 AM. Early check-in or late check-out may be available upon request and subject to availability (additional fees may apply).",
  },
  {
    id: "no-smoking",
    icon: "CigaretteOff",
    title: "No Smoking",
    description: "Chez Shiobara is a smoke-free property. Smoking (including e-cigarettes and vaping) is strictly prohibited inside the building and on balconies. A designated outdoor smoking area is available.",
  },
  {
    id: "guests-visitors",
    icon: "Users",
    title: "Guests & Visitors",
    description: "Only registered guests are permitted on the premises overnight. Please inform us in advance if you plan to have daytime visitors. Maximum occupancy per room must be respected.",
  },
  {
    id: "quiet-hours",
    icon: "Volume2",
    title: "Quiet Hours",
    description: "Please observe quiet hours from 10:00 PM to 8:00 AM to ensure a peaceful environment for all guests.",
  },
  {
    id: "pets-policy",
    icon: "PawPrint",
    title: "Pets Policy",
    description: "We love animals, but unfortunately, we cannot accommodate pets at this time, with the exception of certified service animals as required by law.",
  },
  {
    id: "amenities-usage",
    icon: "Waves",
    title: "Amenities Usage",
    description: "Please use all B&B amenities responsibly. Instructions for appliances and facilities are provided in the House Guide. Report any damages or malfunctions immediately.",
  },
  {
    id: "no-parties",
    icon: "PartyPopper",
    title: "No Parties or Events",
    description: "Parties or large gatherings are not permitted on the premises without prior written consent from the management.",
  },
];

export async function getRulesPageContent(): Promise<RulesPageContent | null> {
  try {
    const docRef = doc(db, "siteContent", "rulesPage");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data && Array.isArray(data.rulesList)) {
        return data as RulesPageContent;
      } else {
        console.warn("Firestore 'rulesPage' document data is not in the expected format. Seeding with initial data.");
        await setDoc(docRef, { rulesList: initialRulesData });
        return { rulesList: initialRulesData };
      }
    } else {
      console.log("'rulesPage' document does not exist in Firestore. Creating and seeding with initial data.");
      await setDoc(docRef, { rulesList: initialRulesData });
      return { rulesList: initialRulesData };
    }
  } catch (error) {
    console.error("Error fetching rules page content from Firestore: ", error);
    return { rulesList: initialRulesData }; 
  }
}

export async function updateRulesPageContent(newRules: RuleItem[]): Promise<{ success: boolean; message: string }> {
  try {
    const docRef = doc(db, "siteContent", "rulesPage");
    await setDoc(docRef, { rulesList: newRules }, { merge: true });
    return { success: true, message: "House rules updated successfully." };
  } catch (error) {
    console.error("Error updating rules page content in Firestore: ", error);
    return { success: false, message: "Failed to update house rules." };
  }
}

// --- House Guide Content ---
export interface HouseGuideItem {
  id: string;
  icon: string; // Name of the lucide icon
  title: string;
  content: string; // Content as a string, newlines can be used for paragraphs
}

export interface HouseGuidePageContent {
  guideItems: HouseGuideItem[];
}

const initialHouseGuideData: HouseGuideItem[] = [
  {
    id: "wifi",
    title: "Wi-Fi Access",
    icon: "Wifi",
    content: "Connect to our complimentary high-speed Wi-Fi to stay connected during your stay.\n\nNetwork Name (SSID): ChezShiobara_Guest\nPassword: WelcomeToShiobara\n\nIf you experience any issues, please let us know.",
  },
  {
    id: "coffee-machine",
    title: "Coffee Machine (In-Room/Communal)",
    icon: "Coffee",
    content: "Enjoy a fresh cup of coffee anytime. Your room is equipped with a personal coffee maker / A communal coffee station is available in the dining area.\n\nInstructions:\n1. Fill the water reservoir with fresh cold water.\n2. Place a coffee pod/filter with ground coffee into the designated compartment.\n3. Position your mug on the tray.\n4. Press the 'Start' or brew button.\n\nCoffee pods, sugar, and creamer are replenished daily / available at the station. Please ask if you need more.",
  },
  {
    id: "television",
    title: "Television & Entertainment",
    icon: "Tv",
    content: "Your room is equipped with a smart TV offering access to various streaming services (Netflix, Hulu, etc. - guest account required for some) and local channels.\n\nUse the remote control to navigate. The 'Source' or 'Input' button allows you to switch between TV channels and HDMI inputs (e.g., for your own devices).\n\nA list of available channels is provided [Location, e.g., in the welcome booklet].",
  },
  {
    id: "thermostat",
    title: "Heating & Air Conditioning",
    icon: "Thermometer",
    content: "Control your room's temperature using the wall-mounted thermostat.\n\nTo adjust: Use the up/down arrows to set your desired temperature. Select 'Heat', 'Cool', or 'Auto' mode as needed.\n\nPlease be mindful of energy consumption and turn off the AC/heater when leaving the room for extended periods or with windows open.",
  },
  {
    id: "laundry",
    title: "Laundry Facilities (If applicable)",
    icon: "WashingMachine",
    content: "Guest laundry facilities (washer and dryer) are available [Location, e.g., on the ground floor].\n\nOperating Hours: [e.g., 8:00 AM - 9:00 PM]\n\nDetergent is [e.g., provided / available for purchase]. Please follow the instructions on the machines. We are not responsible for items damaged during washing.",
  },
];

export async function getHouseGuideContent(): Promise<HouseGuidePageContent | null> {
  try {
    const docRef = doc(db, "siteContent", "houseGuidePage");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // Basic validation, can be expanded
      if (data && Array.isArray(data.guideItems)) {
        return data as HouseGuidePageContent;
      } else {
        console.warn("Firestore 'houseGuidePage' document data is not in the expected format. Seeding with initial data.");
        await setDoc(docRef, { guideItems: initialHouseGuideData });
        return { guideItems: initialHouseGuideData };
      }
    } else {
      console.log("'houseGuidePage' document does not exist in Firestore. Creating and seeding with initial data.");
      await setDoc(docRef, { guideItems: initialHouseGuideData });
      return { guideItems: initialHouseGuideData };
    }
  } catch (error) {
    console.error("Error fetching house guide content from Firestore: ", error);
    return { guideItems: initialHouseGuideData }; // Fallback to initial data on error
  }
}

export async function updateHouseGuideContent(newItems: HouseGuideItem[]): Promise<{ success: boolean; message: string }> {
  try {
    const docRef = doc(db, "siteContent", "houseGuidePage");
    await setDoc(docRef, { guideItems: newItems }, { merge: true });
    return { success: true, message: "House guide updated successfully." };
  } catch (error) {
    console.error("Error updating house guide content in Firestore: ", error);
    return { success: false, message: "Failed to update house guide." };
  }
}


// --- Welcome Page Gallery Content ---
export interface GalleryImageItem {
  id: string;
  src: string;
  alt: string;
  dataAiHint: string;
}

export interface WelcomePageGalleryContent {
  galleryImages: GalleryImageItem[];
}

const initialGalleryData: GalleryImageItem[] = [
  { id: "gallery_img_1", src: "https://placehold.co/600x400.png", alt: "Beautiful B&B exterior", dataAiHint: "house exterior" },
  { id: "gallery_img_2", src: "https://placehold.co/600x400.png", alt: "Cozy room interior", dataAiHint: "bedroom interior" },
  { id: "gallery_img_3", src: "https://placehold.co/600x400.png", alt: "Scenic local view", dataAiHint: "nature landscape" },
  { id: "gallery_img_4", src: "https://placehold.co/600x400.png", alt: "Delicious breakfast", dataAiHint: "breakfast food" },
  { id: "gallery_img_5", src: "https://placehold.co/600x400.png", alt: "Garden area", dataAiHint: "garden flowers" },
  { id: "gallery_img_6", src: "https://placehold.co/600x400.png", alt: "Nearby attraction", dataAiHint: "local landmark" },
];

export async function getWelcomePageGalleryContent(): Promise<WelcomePageGalleryContent> {
  try {
    const docRef = doc(db, "siteContent", "welcomePageGallery");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data && Array.isArray(data.galleryImages) && data.galleryImages.length > 0) {
        const validatedImages = data.galleryImages.map((img: any, index: number) => ({
          id: img.id || uuidv4(),
          src: img.src || "https://placehold.co/600x400.png",
          alt: img.alt || "Placeholder image",
          dataAiHint: img.dataAiHint || "image",
        }));
        return { galleryImages: validatedImages };
      } else {
        console.warn("Firestore 'welcomePageGallery' data malformed or empty. Seeding with initial data.");
        const seededData = initialGalleryData.map(img => ({ ...img, id: img.id || uuidv4() }));
        await setDoc(docRef, { galleryImages: seededData });
        return { galleryImages: seededData };
      }
    } else {
      console.log("'welcomePageGallery' document does not exist. Creating and seeding.");
      const seededData = initialGalleryData.map(img => ({ ...img, id: img.id || uuidv4() }));
      await setDoc(docRef, { galleryImages: seededData });
      return { galleryImages: seededData };
    }
  } catch (error) {
    console.error("Error fetching welcome page gallery from Firestore: ", error);
    return { galleryImages: initialGalleryData.map(img => ({ ...img, id: img.id || uuidv4() })) }; // Fallback
  }
}

export async function updateWelcomePageGalleryContent(newImages: GalleryImageItem[]): Promise<{ success: boolean; message: string }> {
  try {
    const docRef = doc(db, "siteContent", "welcomePageGallery");
    const imagesToSave = newImages.map(img => ({
      ...img,
      id: img.id || uuidv4(), // Ensure ID exists
    }));
    await setDoc(docRef, { galleryImages: imagesToSave }, { merge: true });
    return { success: true, message: "Welcome page gallery updated successfully." };
  } catch (error) {
    console.error("Error updating welcome page gallery content in Firestore: ", error);
    return { success: false, message: "Failed to update welcome page gallery." };
  }
}

// --- Local Tips Page Content ---
export interface LocalTipItem {
  id: string;
  title: string;
  description: string;
  category: string; // e.g., "Dining", "Sightseeing", "Activities", "Hidden Gem"
  imageUrl?: string;
  dataAiHint?: string;
}

export interface LocalTipsPageContent {
  localTips: LocalTipItem[];
}

const initialLocalTipsData: LocalTipItem[] = [
  {
    id: uuidv4(),
    title: "Gora Brewery & Grill",
    description: "Enjoy craft beers and delicious grilled food in a relaxed atmosphere. Great for an evening out.",
    category: "Dining",
    imageUrl: "https://placehold.co/600x400.png",
    dataAiHint: "restaurant interior",
  },
  {
    id: uuidv4(),
    title: "Hakone Open-Air Museum",
    description: "Explore a stunning collection of contemporary sculptures set against the backdrop of Hakone's mountains. A must-visit for art lovers.",
    category: "Sightseeing",
    imageUrl: "https://placehold.co/600x400.png",
    dataAiHint: "outdoor sculpture",
  },
  {
    id: uuidv4(),
    title: "Lake Ashi Boat Cruise",
    description: "Take a scenic boat cruise on Lake Ashi for breathtaking views of Mt. Fuji (on clear days) and the surrounding nature.",
    category: "Activities",
    imageUrl: "https://placehold.co/600x400.png",
    dataAiHint: "lake boat",
  },
  {
    id: uuidv4(),
    title: "Amazake-chaya Tea House",
    description: "Step back in time at this traditional tea house serving amazake (sweet, non-alcoholic rice drink) and mochi. A unique cultural experience.",
    category: "Hidden Gem",
    imageUrl: "https://placehold.co/600x400.png",
    dataAiHint: "traditional teahouse",
  },
];

export async function getLocalTipsPageContent(): Promise<LocalTipsPageContent> {
  try {
    const docRef = doc(db, "siteContent", "localTipsPage");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data && Array.isArray(data.localTips) && data.localTips.length > 0) {
        const validatedTips = data.localTips.map((tip: any) => ({
          id: tip.id || uuidv4(),
          title: tip.title || "Untitled Tip",
          description: tip.description || "No description provided.",
          category: tip.category || "General",
          imageUrl: tip.imageUrl, // Optional
          dataAiHint: tip.dataAiHint, // Optional
        }));
        return { localTips: validatedTips };
      } else {
        console.warn("Firestore 'localTipsPage' data malformed or empty. Seeding with initial data.");
        const seededData = initialLocalTipsData.map(tip => ({ ...tip, id: tip.id || uuidv4() }));
        await setDoc(docRef, { localTips: seededData });
        return { localTips: seededData };
      }
    } else {
      console.log("'localTipsPage' document does not exist. Creating and seeding.");
      const seededData = initialLocalTipsData.map(tip => ({ ...tip, id: tip.id || uuidv4() }));
      await setDoc(docRef, { localTips: seededData });
      return { localTips: seededData };
    }
  } catch (error) {
    console.error("Error fetching local tips from Firestore: ", error);
    // Fallback to initial data, ensuring IDs are present
    return { localTips: initialLocalTipsData.map(tip => ({ ...tip, id: tip.id || uuidv4() })) };
  }
}

export async function updateLocalTipsPageContent(newTips: LocalTipItem[]): Promise<{ success: boolean; message: string }> {
  try {
    const docRef = doc(db, "siteContent", "localTipsPage");
    const tipsToSave = newTips.map(tip => ({
      ...tip,
      id: tip.id || uuidv4(), // Ensure ID exists
    }));
    await setDoc(docRef, { localTips: tipsToSave }, { merge: true });
    return { success: true, message: "Local tips updated successfully." };
  } catch (error) {
    console.error("Error updating local tips content in Firestore: ", error);
    return { success: false, message: "Failed to update local tips." };
  }
}

// --- Commerce Disclosure Page Content ---
export interface CommerceDisclosureContent {
  businessName: string;
  legalName: string;
  businessAddress: string; // multiline
  contactEmail: string;
  contactPhone: string;
  businessRegistrationInfo: string; // multiline
  descriptionOfGoods: string; // multiline
  transactionCurrencyInfo: string; // multiline
  paymentMethodsInfo: string; // multiline
  refundCancellationPolicy: string; // multiline
  deliveryShippingPolicy: string; // multiline
  privacyPolicySummary: string; // multiline
  termsOfServiceSummary: string; // multiline
  exportRestrictionsInfo: string; // multiline
  customerServiceContactInfo: string; // multiline
  updatedAt?: any; // Firestore ServerTimestamp
}

const initialCommerceDisclosureData: CommerceDisclosureContent = {
  businessName: "Chez Shiobara B&B",
  legalName: "Shawn Shiobara",
  businessAddress: "16-7 Karasawa, Minami-ku\nYokohama, Kanagawa 232-0034\nJapan",
  contactEmail: "us@shiobara.love",
  contactPhone: "+81 070 9058 2258",
  businessRegistrationInfo: "Chez Shiobara B&B is operated by [Your Legal Entity Name, if applicable].\nBusiness Registration Number (Japan): [Your Business Registration Number, if applicable. E.g., XXXXXXXXXXXXX]\n\n<em class=\"text-sm text-muted-foreground\">Please update this section with your specific legal entity name and registration number if you have one. If you are operating as an individual without a separate business registration, you may need to adjust this or consult local regulations.</em>",
  descriptionOfGoods: "Chez Shiobara B&B offers short-term accommodation services. This includes lodging in our guest room(s), and may include breakfast and access to common household amenities as described on our website and during the booking process.",
  transactionCurrencyInfo: "All prices and transactions are processed in USD (United States Dollars), unless explicitly stated otherwise during the booking or payment process. Your card issuer may apply their own exchange rates and fees if your card is not denominated in USD.",
  paymentMethodsInfo: "We primarily accept payments via major credit and debit cards (Visa, MasterCard, American Express, etc.) processed securely through Stripe.\nOther payment methods, such as PayPal or Wise, may be available and will be indicated during the booking confirmation process or can be viewed on our admin-managed payment settings (information provided upon request for guests).",
  refundCancellationPolicy: "IMPORTANT: The following is a general template. Please replace this with your actual, specific cancellation policy.\n\n- Cancellations made more than [Specify Number, e.g., 14] days prior to the scheduled check-in date will receive a full refund of the amount paid, minus any non-refundable transaction fees charged by payment processors.\n- Cancellations made between [Specify Number, e.g., 7] and [Specify Number, e.g., 14] days prior to the scheduled check-in date will be eligible for a [Specify Percentage, e.g., 50]% refund of the total booking cost.\n- Cancellations made less than [Specify Number, e.g., 7] days prior to the scheduled check-in date, or in the case of a no-show, are non-refundable, and the full booking amount will be forfeited.\n- Early departures are typically treated as last-minute cancellations for the remaining nights and are non-refundable unless otherwise agreed upon in writing by Chez Shiobara B&B management.\n- Modifications to booking dates are subject to availability and may be subject to rate changes. Significant changes may be treated as a cancellation and re-booking.\n- We strongly recommend guests consider travel insurance to cover unforeseen circumstances that may lead to cancellation.\n- To request a cancellation or modification, please contact us directly via email at us@shiobara.love as soon as possible.\n\n<em class=\"text-sm text-muted-foreground\">This policy is subject to change. The policy in effect at the time of your booking will apply. Please refer to your booking confirmation for specific terms.</em>",
  deliveryShippingPolicy: "As Chez Shiobara B&B provides accommodation and related services, no physical goods are shipped. All booking confirmations and communications will be delivered electronically via email to the address provided during the booking process.",
  privacyPolicySummary: "We are committed to protecting your privacy. Personal information (such as name, email address, payment details) collected during the booking and payment process is used solely for the purposes of:\n\n- Securing and managing your booking.\n- Processing payments securely via our payment gateway (Stripe).\n- Communicating with you regarding your stay (confirmations, pre-arrival information, post-stay follow-up).\n- Complying with legal or regulatory requirements in Japan.\n\nWe do not sell, trade, or otherwise transfer your personally identifiable information to outside parties for their marketing purposes without your explicit consent, except as necessary to provide our services (e.g., sharing necessary details with Stripe for payment processing). We implement a variety of security measures to maintain the safety of your personal information.\n\n<em class=\"text-sm text-muted-foreground\">We recommend creating a more detailed, standalone Privacy Policy page and linking to it from here for comprehensive coverage.</em>",
  termsOfServiceSummary: "By making a booking with Chez Shiobara B&B, you acknowledge and agree to comply with our House Rules, our payment terms, and the cancellation policy stated herein. All guests are expected to behave in a respectful manner towards hosts, other guests (if any), and the property. Failure to comply may result in termination of your stay without refund.\n\n<em class=\"text-sm text-muted-foreground\">We recommend creating a more detailed, standalone Terms of Service page and linking to it from here.</em>",
  exportRestrictionsInfo: "Not applicable to the services offered by Chez Shiobara B&B.",
  customerServiceContactInfo: "For any questions, concerns, or assistance regarding your booking, payment, our services, or this disclosure, please contact us:\n\n- Email: us@shiobara.love\n- Phone: +81 070 9058 2258\n- You can also reach us via the contact form on our Contact Us page.",
};

export async function getCommerceDisclosureContent(): Promise<CommerceDisclosureContent> {
  try {
    const docRef = doc(db, "siteContent", "commerceDisclosurePage");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // Ensure all fields from initialData are present, falling back to defaults if a field is missing
      const storedData = docSnap.data();
      const mergedData = { ...initialCommerceDisclosureData, ...storedData } as CommerceDisclosureContent;
      if(storedData.updatedAt) {
        mergedData.updatedAt = (storedData.updatedAt as any).toDate(); // Convert Timestamp to Date if it exists
      }
      return mergedData;
    } else {
      console.log("'commerceDisclosurePage' document does not exist. Creating and seeding.");
      const dataToSeed = { ...initialCommerceDisclosureData, updatedAt: serverTimestamp() };
      await setDoc(docRef, dataToSeed);
      return { ...initialCommerceDisclosureData, legalName: initialCommerceDisclosureData.legalName || "", updatedAt: new Date() }; // Return with current date for updatedAt
    }
  } catch (error) {
    console.error("Error fetching commerce disclosure content from Firestore: ", error);
    return { ...initialCommerceDisclosureData, legalName: initialCommerceDisclosureData.legalName || "", updatedAt: new Date() }; // Fallback with current date
  }
}

export async function updateCommerceDisclosureContent(newContent: Omit<CommerceDisclosureContent, 'updatedAt'>): Promise<{ success: boolean; message: string }> {
  try {
    const docRef = doc(db, "siteContent", "commerceDisclosurePage");
    const dataToSet = {
      ...newContent,
      updatedAt: serverTimestamp(),
    };
    await setDoc(docRef, dataToSet, { merge: true });
    return { success: true, message: "Commerce Disclosure content updated successfully." };
  } catch (error) {
    console.error("Error updating commerce disclosure content in Firestore: ", error);
    return { success: false, message: "Failed to update Commerce Disclosure content." };
  }
}

