
"use server";

import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import type { LucideIcon } from "lucide-react";

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
    icon: "Waves", // Consider changing if not fitting, maybe 'Settings' or 'Info'
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
      // Ensure the data matches the RulesPageContent structure
      const data = docSnap.data();
      if (data && Array.isArray(data.rulesList)) {
        return data as RulesPageContent;
      } else {
        console.warn("Firestore 'rulesPage' document data is not in the expected format. Seeding with initial data.");
        // If data is malformed or rulesList is missing, seed with initial data
        await setDoc(docRef, { rulesList: initialRulesData });
        return { rulesList: initialRulesData };
      }
    } else {
      console.log("'rulesPage' document does not exist in Firestore. Creating and seeding with initial data.");
      // Document doesn't exist, create it with initial data
      await setDoc(docRef, { rulesList: initialRulesData });
      return { rulesList: initialRulesData };
    }
  } catch (error) {
    console.error("Error fetching rules page content from Firestore: ", error);
    // Attempt to return initial data as a fallback if Firestore is unreachable or errors out,
    // though this might not be ideal if the intent is to always use live data.
    // For now, to prevent a blank page on first load error:
    return { rulesList: initialRulesData }; 
  }
}

export async function updateRulesPageContent(newRules: RuleItem[]): Promise<{ success: boolean; message: string }> {
  try {
    const docRef = doc(db, "siteContent", "rulesPage");
    await setDoc(docRef, { rulesList: newRules }, { merge: true }); // merge true in case other fields exist in rulesPage
    return { success: true, message: "House rules updated successfully." };
  } catch (error) {
    console.error("Error updating rules page content in Firestore: ", error);
    return { success: false, message: "Failed to update house rules." };
  }
}
