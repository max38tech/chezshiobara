
"use server";

import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export interface PricingTier {
  perNight1Person: number;
  perNight2People: number;
  perWeek1Person: number;
  perWeek2People: number;
  perMonth1Person: number;
  perMonth2People: number;
}

export interface PricingConfiguration extends PricingTier {
  currency: string; // e.g., "JPY", "USD"
  updatedAt?: FirebaseFirestore.Timestamp;
}

const initialPricingData: PricingConfiguration = {
  perNight1Person: 8000,
  perNight2People: 12000,
  perWeek1Person: 50000, // Approx 7142/night
  perWeek2People: 77000, // Approx 11000/night
  perMonth1Person: 180000, // Approx 6000/night
  perMonth2People: 270000, // Approx 9000/night
  currency: "JPY",
};

export async function getPricingConfiguration(): Promise<PricingConfiguration> {
  try {
    const docRef = doc(db, "siteSettings", "pricing");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as PricingConfiguration;
      // Ensure all fields from initialPricingData are present, falling back to defaults if not
      return {
        ...initialPricingData, // provides defaults for any missing fields
        ...data, // overrides defaults with existing data
        currency: data.currency || initialPricingData.currency, // Ensure currency has a value
      };
    } else {
      console.log("'pricing' document does not exist in Firestore. Creating and seeding with initial data.");
      await setDoc(docRef, { ...initialPricingData, updatedAt: serverTimestamp() });
      return initialPricingData;
    }
  } catch (error) {
    console.error("Error fetching pricing configuration from Firestore: ", error);
    return initialPricingData; // Fallback to initial data on error
  }
}

export async function updatePricingConfiguration(newConfig: Omit<PricingConfiguration, 'currency' | 'updatedAt'>): Promise<{ success: boolean; message: string }> {
  try {
    const docRef = doc(db, "siteSettings", "pricing");
    // Preserve existing currency, only update pricing tiers and updatedAt timestamp
    const currentConfig = await getPricingConfiguration();
    const dataToSet: PricingConfiguration = {
      ...currentConfig, // carry over existing fields like currency
      ...newConfig,     // apply new tier prices
      updatedAt: serverTimestamp(),
    };
    await setDoc(docRef, dataToSet, { merge: true });
    return { success: true, message: "Pricing configuration updated successfully." };
  } catch (error) {
    console.error("Error updating pricing configuration in Firestore: ", error);
    return { success: false, message: "Failed to update pricing configuration." };
  }
}
