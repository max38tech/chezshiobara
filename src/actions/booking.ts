
"use server";

import type { BookingRequestFormValues } from "@/schemas/booking";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function handleBookingRequest(data: BookingRequestFormValues) {
  console.log("Booking request received:", data);

  try {
    // Prepare data for Firestore
    // Firestore handles Date objects correctly for Timestamp fields
    const bookingData = {
      ...data,
      guests: Number(data.guests), // Ensure guests is a number
      createdAt: serverTimestamp(), // Add a server-side timestamp
    };

    // Add a new document with a generated ID to the "bookingRequests" collection
    const docRef = await addDoc(collection(db, "bookingRequests"), bookingData);
    console.log("Document written with ID: ", docRef.id);

    return {
      success: true,
      message: "Your booking request has been successfully submitted! We will contact you shortly to confirm.",
    };
  } catch (error) {
    console.error("Error adding document to Firestore: ", error);
    return {
      success: false,
      message: "We encountered an issue submitting your booking request. Please try again or contact us directly.",
    };
  }
}
