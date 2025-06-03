
"use server";

import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import type { LucideIcon } from "lucide-react";

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
