
"use server";

import type { BookingRequestFormValues } from "@/schemas/booking";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDocs, query, where, Timestamp } from "firebase/firestore";

export async function handleBookingRequest(data: BookingRequestFormValues) {
  console.log("Booking request received:", data);

  try {
    // Prepare data for Firestore
    const bookingData = {
      ...data,
      guests: Number(data.guests), // Ensure guests is a number
      createdAt: serverTimestamp(), // Add a server-side timestamp
      status: "pending", // Default status for new requests
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

export async function approveBookingRequest(requestId: string) {
  try {
    const requestRef = doc(db, "bookingRequests", requestId);
    await updateDoc(requestRef, {
      status: "confirmed",
    });
    console.log(`Booking request ${requestId} approved.`);
    return { success: true, message: "Booking request approved successfully." };
  } catch (error) {
    console.error("Error approving booking request: ", error);
    return { success: false, message: "Failed to approve booking request." };
  }
}

export async function declineBookingRequest(requestId: string) {
  try {
    const requestRef = doc(db, "bookingRequests", requestId);
    await updateDoc(requestRef, {
      status: "declined",
    });
    console.log(`Booking request ${requestId} declined.`);
    return { success: true, message: "Booking request declined successfully." };
  } catch (error) {
    console.error("Error declining booking request: ", error);
    return { success: false, message: "Failed to decline booking request." };
  }
}

export interface ConfirmedBooking {
  id: string;
  name: string;
  checkInDate: Date;
  checkOutDate: Date;
}

export async function getConfirmedBookings(): Promise<ConfirmedBooking[]> {
  try {
    const requestsCollection = collection(db, 'bookingRequests');
    const q = query(requestsCollection, where('status', '==', 'confirmed'));
    const querySnapshot = await getDocs(q);
    
    const bookings = querySnapshot.docs.map(docSnapshot => {
      const data = docSnapshot.data();
      return {
        id: docSnapshot.id,
        name: data.name,
        // Firestore Timestamps need to be converted to JS Date objects
        checkInDate: (data.checkInDate as Timestamp).toDate(),
        checkOutDate: (data.checkOutDate as Timestamp).toDate(),
      };
    });
    return bookings;
  } catch (error) {
    console.error("Error fetching confirmed bookings: ", error);
    return []; // Return empty array on error
  }
}
