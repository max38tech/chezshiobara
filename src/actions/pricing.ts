
"use server";

import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp, type Timestamp } from "firebase/firestore";

export interface PricingTier {
  perNight1Person: number;
  perNight2People: number;
  perWeek1Person: number;
  perWeek2People: number;
  perMonth1Person: number;
  perMonth2People: number;
}

// Interface for data as stored in Firestore
interface PricingConfigurationStored extends PricingTier {
  currency: string;
  updatedAt?: Timestamp;
}

// Interface for data as returned to the client (Timestamp converted to Date)
export interface ClientSafePricingConfiguration extends PricingTier {
  currency: string;
  updatedAt?: Date;
}

const initialPricingDataValues: Omit<ClientSafePricingConfiguration, 'updatedAt' | 'currency'> = {
  perNight1Person: 8000,
  perNight2People: 12000,
  perWeek1Person: 50000,
  perWeek2People: 77000,
  perMonth1Person: 180000,
  perMonth2People: 270000,
};

const defaultCurrency = "JPY";

export async function getPricingConfiguration(): Promise<ClientSafePricingConfiguration> {
  try {
    const docRef = doc(db, "siteSettings", "pricing");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const storedData = docSnap.data() as PricingConfigurationStored;
      return {
        ...initialPricingDataValues, // provides defaults for tier prices
        currency: storedData.currency || defaultCurrency,
        // Apply stored tier prices over defaults if they exist
        perNight1Person: storedData.perNight1Person !== undefined ? storedData.perNight1Person : initialPricingDataValues.perNight1Person,
        perNight2People: storedData.perNight2People !== undefined ? storedData.perNight2People : initialPricingDataValues.perNight2People,
        perWeek1Person: storedData.perWeek1Person !== undefined ? storedData.perWeek1Person : initialPricingDataValues.perWeek1Person,
        perWeek2People: storedData.perWeek2People !== undefined ? storedData.perWeek2People : initialPricingDataValues.perWeek2People,
        perMonth1Person: storedData.perMonth1Person !== undefined ? storedData.perMonth1Person : initialPricingDataValues.perMonth1Person,
        perMonth2People: storedData.perMonth2People !== undefined ? storedData.perMonth2People : initialPricingDataValues.perMonth2People,
        updatedAt: storedData.updatedAt ? storedData.updatedAt.toDate() : undefined,
      };
    } else {
      console.log("'pricing' document does not exist in Firestore. Creating and seeding with initial data.");
      const dataToSeed: PricingConfigurationStored = {
        ...initialPricingDataValues,
        currency: defaultCurrency,
        updatedAt: serverTimestamp() as Timestamp,
      };
      await setDoc(docRef, dataToSeed);
      // After seeding, we return client-safe data. The timestamp will effectively be "now" but represented as Date.
      // For simplicity on first load after seed, we can return undefined for updatedAt or fetch again.
      // Returning undefined for updatedAt for the very first load post-seed is fine.
      return { ...initialPricingDataValues, currency: defaultCurrency, updatedAt: new Date() }; // Or undefined if serverTimestamp is complex to convert here
    }
  } catch (error) {
    console.error("Error fetching pricing configuration from Firestore: ", error);
    return { ...initialPricingDataValues, currency: defaultCurrency, updatedAt: undefined }; // Fallback
  }
}

export async function updatePricingConfiguration(newConfig: Omit<ClientSafePricingConfiguration, 'currency' | 'updatedAt'>): Promise<{ success: boolean; message: string }> {
  try {
    const docRef = doc(db, "siteSettings", "pricing");
    // Get current currency, as it's not part of the form submission directly
    const currentClientConfig = await getPricingConfiguration();
    
    const dataToSet: PricingConfigurationStored = {
      ...newConfig, // new tier prices
      currency: currentClientConfig.currency, // preserve existing currency
      updatedAt: serverTimestamp() as Timestamp, // set new server timestamp
    };

    await setDoc(docRef, dataToSet, { merge: true }); // merge to be safe, though we are setting all tiers
    return { success: true, message: "Pricing configuration updated successfully." };
  } catch (error) {
    console.error("Error updating pricing configuration in Firestore: ", error);
    return { success: false, message: "Failed to update pricing configuration." };
  }
}
