
"use server";

import type { BookingRequestFormValues } from "@/schemas/booking";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDocs, query, where, Timestamp } from "firebase/firestore";
import { differenceInDays } from 'date-fns';
import type { ClientSafePricingConfiguration } from '@/actions/pricing';

export async function handleBookingRequest(data: BookingRequestFormValues) {
  console.log("Booking request received:", data);

  try {
    const bookingData = {
      ...data,
      guests: Number(data.guests), 
      createdAt: serverTimestamp(), 
      status: "pending", 
    };

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
        checkInDate: (data.checkInDate as Timestamp).toDate(),
        checkOutDate: (data.checkOutDate as Timestamp).toDate(),
      };
    });
    return bookings;
  } catch (error) {
    console.error("Error fetching confirmed bookings: ", error);
    return [];
  }
}

export interface BookingCalculationRequest {
  checkInDate: Date;
  checkOutDate: Date;
  guests: number;
}

export async function calculateInvoiceDetails(
  bookingDetails: BookingCalculationRequest,
  pricingConfig: ClientSafePricingConfiguration
) {
  const { checkInDate, checkOutDate, guests } = bookingDetails;
  const nights = differenceInDays(checkOutDate, checkInDate);

  if (nights <= 0) {
    return {
      totalAmount: 0,
      currency: pricingConfig.currency,
      breakdown: "Check-out date must be after check-in date, resulting in 0 or negative nights.",
      appliedStrategy: "Error",
    };
  }

  const onePersonRate = {
    nightly: pricingConfig.perNight1Person,
    weekly: pricingConfig.perWeek1Person,
    monthly: pricingConfig.perMonth1Person,
  };
  const twoPersonRate = {
    nightly: pricingConfig.perNight2People,
    weekly: pricingConfig.perWeek2People,
    monthly: pricingConfig.perMonth2People,
  };

  const rate = guests >= 2 ? twoPersonRate : onePersonRate;

  // Strategy 1: Purely Nightly
  const nightlyTotal = nights * rate.nightly;
  let bestTotal = nightlyTotal;
  let bestStrategy = "Nightly";
  let breakdownParts: string[] = [];
  
  // Strategy 2: Weekly Priority
  const weeks = Math.floor(nights / 7);
  const remainingNightsAfterWeeks = nights % 7;
  const weeklyPriorityTotal = (weeks * rate.weekly) + (remainingNightsAfterWeeks * rate.nightly);

  if (weeklyPriorityTotal < bestTotal) {
    bestTotal = weeklyPriorityTotal;
    bestStrategy = "Weekly Priority";
  }

  // Strategy 3: Monthly Priority
  const approxDaysInMonth = 30; 
  const months = Math.floor(nights / approxDaysInMonth);
  const remainingNightsAfterMonths = nights % approxDaysInMonth;
  const remainingWeeksAfterMonths = Math.floor(remainingNightsAfterMonths / 7);
  const finalRemainingNights = remainingNightsAfterMonths % 7;

  const monthlyPriorityTotal = (months * rate.monthly) + (remainingWeeksAfterMonths * rate.weekly) + (finalRemainingNights * rate.nightly);

  if (monthlyPriorityTotal < bestTotal) {
    bestTotal = monthlyPriorityTotal;
    bestStrategy = "Monthly Priority";
  }
  
  // Construct breakdown based on the chosen best strategy
  if (bestStrategy === "Nightly") {
    breakdownParts.push(`${nights} night(s) at ${rate.nightly.toFixed(2)} ${pricingConfig.currency}/night`);
  } else if (bestStrategy === "Weekly Priority") {
    if (weeks > 0) breakdownParts.push(`${weeks} week(s) at ${rate.weekly.toFixed(2)} ${pricingConfig.currency}/week`);
    if (remainingNightsAfterWeeks > 0) breakdownParts.push(`${remainingNightsAfterWeeks} night(s) at ${rate.nightly.toFixed(2)} ${pricingConfig.currency}/night`);
  } else if (bestStrategy === "Monthly Priority") {
    // Use the 'months', 'remainingWeeksAfterMonths', 'finalRemainingNights' calculated for this strategy
    if (months > 0) breakdownParts.push(`${months} month(s) at ${rate.monthly.toFixed(2)} ${pricingConfig.currency}/month`);
    if (remainingWeeksAfterMonths > 0) breakdownParts.push(`${remainingWeeksAfterMonths} week(s) at ${rate.weekly.toFixed(2)} ${pricingConfig.currency}/week`);
    if (finalRemainingNights > 0) breakdownParts.push(`${finalRemainingNights} night(s) at ${rate.nightly.toFixed(2)} ${pricingConfig.currency}/night`);
  }
  
  const finalBreakdown = breakdownParts.length > 0 ? breakdownParts.join(' + ') : "Pricing applied directly.";

  return {
    totalAmount: parseFloat(bestTotal.toFixed(2)),
    currency: pricingConfig.currency,
    breakdown: `Calculated as: ${finalBreakdown}`,
    appliedStrategy: bestStrategy,
  };
}
