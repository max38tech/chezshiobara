
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
  perNight1Person: 80,
  perNight2People: 120,
  perWeek1Person: 500,
  perWeek2People: 770,
  perMonth1Person: 1800,
  perMonth2People: 2700,
};

const defaultCurrency = "USD";

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
      console.log(`'pricing' document does not exist in Firestore. Creating and seeding with initial data (Currency: ${defaultCurrency}).`);
      const dataToSeed: PricingConfigurationStored = {
        ...initialPricingDataValues,
        currency: defaultCurrency,
        updatedAt: serverTimestamp() as Timestamp,
      };
      await setDoc(docRef, dataToSeed);
      return { ...initialPricingDataValues, currency: defaultCurrency, updatedAt: new Date() }; 
    }
  } catch (error) {
    console.error("Error fetching pricing configuration from Firestore: ", error);
    return { ...initialPricingDataValues, currency: defaultCurrency, updatedAt: undefined }; // Fallback
  }
}

export async function updatePricingConfiguration(newConfig: Omit<ClientSafePricingConfiguration, 'currency' | 'updatedAt'>): Promise<{ success: boolean; message: string }> {
  try {
    const docRef = doc(db, "siteSettings", "pricing");
    const currentClientConfig = await getPricingConfiguration();
    
    const dataToSet: PricingConfigurationStored = {
      ...newConfig, 
      currency: currentClientConfig.currency, 
      updatedAt: serverTimestamp() as Timestamp, 
    };

    await setDoc(docRef, dataToSet, { merge: true }); 
    return { success: true, message: "Pricing configuration updated successfully." };
  } catch (error) {
    console.error("Error updating pricing configuration in Firestore: ", error);
    return { success: false, message: "Failed to update pricing configuration." };
  }
}

