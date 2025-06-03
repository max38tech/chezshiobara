
"use server";

import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp, type Timestamp } from "firebase/firestore";
import type { PaymentSettingsFormValues } from "@/schemas/payment";

export interface PaymentSettings extends PaymentSettingsFormValues {
  updatedAt?: Date;
}

const initialPaymentSettingsData: PaymentSettingsFormValues = {
  paypalEmailOrLink: "",
  isPaypalEnabled: false,
  wiseInstructions: "",
  isWiseEnabled: false,
  cardPaymentInstructions: "",
  isCardPaymentEnabled: false,
};

export async function getPaymentSettings(): Promise<PaymentSettings> {
  try {
    const docRef = doc(db, "siteSettings", "paymentMethods");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const storedData = docSnap.data() as PaymentSettingsFormValues & { updatedAt?: Timestamp };
      return {
        ...initialPaymentSettingsData, // provides defaults
        ...storedData,
        updatedAt: storedData.updatedAt ? storedData.updatedAt.toDate() : undefined,
      };
    } else {
      console.log("'paymentMethods' document does not exist. Creating with default empty settings.");
      const dataToSeed = {
        ...initialPaymentSettingsData,
        updatedAt: serverTimestamp() as Timestamp,
      };
      await setDoc(docRef, dataToSeed);
      return { ...initialPaymentSettingsData, updatedAt: new Date() };
    }
  } catch (error) {
    console.error("Error fetching payment settings from Firestore: ", error);
    return { ...initialPaymentSettingsData, updatedAt: undefined }; // Fallback
  }
}

export async function updatePaymentSettings(newSettings: PaymentSettingsFormValues): Promise<{ success: boolean; message: string }> {
  try {
    const docRef = doc(db, "siteSettings", "paymentMethods");
    
    const dataToSet = {
      ...newSettings,
      updatedAt: serverTimestamp() as Timestamp,
    };

    await setDoc(docRef, dataToSet, { merge: true });
    return { success: true, message: "Payment settings updated successfully." };
  } catch (error) {
    console.error("Error updating payment settings in Firestore: ", error);
    return { success: false, message: "Failed to update payment settings." };
  }
}
