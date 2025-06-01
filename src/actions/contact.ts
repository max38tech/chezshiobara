
"use server";

import type { ContactFormValues } from "@/schemas/contact";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function handleContactSubmission(data: ContactFormValues) {
  console.log("Contact form submission received:", data);

  try {
    const contactData = {
      ...data,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "contactMessages"), contactData);
    console.log("Contact message written with ID: ", docRef.id);

    return {
      success: true,
      message: "Your message has been sent successfully! We'll get back to you soon.",
    };
  } catch (error) {
    console.error("Error adding contact message to Firestore: ", error);
    return {
      success: false,
      message: "We encountered an issue sending your message. Please try again or contact us directly.",
    };
  }
}
