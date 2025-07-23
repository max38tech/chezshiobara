"use server";

import { adminDb } from "@/lib/firebase-admin";
import { FieldValue, type Timestamp } from "firebase-admin/firestore";
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
  if (!adminDb) {
    console.error("Firebase Admin is not initialized. Serving initial data.");
    return initialPaymentSettingsData;
  }
  try {
    const docRef = adminDb.collection("siteSettings").doc("paymentMethods");
    const docSnap = await docRef.get();

    if (docSnap.exists) {
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
        updatedAt: FieldValue.serverTimestamp(),
      };
      await adminDb.collection("siteSettings").doc("paymentMethods").set(dataToSeed);
      return { ...initialPaymentSettingsData, updatedAt: new Date() };
    }
  } catch (error) {
    console.error("Error fetching payment settings from Firestore: ", error);
    return { ...initialPaymentSettingsData };
  }
}

export async function updatePaymentSettings(
  settings: PaymentSettingsFormValues
): Promise<{ success: boolean; message: string }> {
  if (!adminDb) {
    console.error("Firebase Admin is not initialized. Cannot update payment settings.");
    return { success: false, message: "Database connection not available." };
  }
  try {
    const docRef = adminDb.collection("siteSettings").doc("paymentMethods");
    await docRef.set({ ...settings, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    return { success: true, message: "Payment settings updated successfully." };
  } catch (error) {
    console.error("Error updating payment settings in Firestore: ", error);
    return {
      success: false,
      message: `Failed to update settings. ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}
