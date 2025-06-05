
"use server";

import type { BookingRequestFormValues, EditableBookingInvoiceFormValues, ManualCalendarEntryFormValues } from "@/schemas/booking";
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
      status: "pending", // Default status for new requests
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

export interface CalendarEvent {
  id: string;
  name: string; // Guest name or block description
  checkInDate: Date;
  checkOutDate: Date;
  status: 'confirmed' | 'blocked' | 'manual_booking' | 'paid' | 'manual_confirmed';
  notes?: string; // Added for editing
  entryType?: 'blocked' | 'manual_booking'; // Added for editing manual entries
}

export async function getAllCalendarEvents(): Promise<CalendarEvent[]> {
  try {
    const requestsCollection = collection(db, 'bookingRequests');
    const q = query(requestsCollection, where('status', 'in', ['confirmed', 'blocked', 'manual_booking', 'paid', 'manual_confirmed']));
    const querySnapshot = await getDocs(q);

    const events = querySnapshot.docs.map(docSnapshot => {
      const data = docSnapshot.data();
      // Determine entryType based on status for manual entries
      let entryType: CalendarEvent['entryType'] | undefined = undefined;
      if (data.status === 'blocked') {
        entryType = 'blocked';
      } else if (data.status === 'manual_booking' || data.status === 'manual_confirmed') {
        entryType = 'manual_booking';
      }

      return {
        id: docSnapshot.id,
        name: data.name || data.entryName || 'Unnamed Event',
        checkInDate: (data.checkInDate as Timestamp).toDate(),
        checkOutDate: (data.checkOutDate as Timestamp).toDate(),
        status: data.status as CalendarEvent['status'],
        notes: data.notes,
        entryType: entryType,
      };
    });
    return events;
  } catch (error) {
    console.error("Error fetching calendar events: ", error);
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
  const nights = differenceInDays(new Date(checkOutDate), new Date(checkInDate));

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

  const nightlyTotal = nights * rate.nightly;
  let bestTotal = nightlyTotal;
  let bestStrategy = "Nightly";

  const weeks = Math.floor(nights / 7);
  const remainingNightsAfterWeeks = nights % 7;
  const weeklyPriorityTotal = (weeks * rate.weekly) + (remainingNightsAfterWeeks * rate.nightly);

  if (weeklyPriorityTotal < bestTotal) {
    bestTotal = weeklyPriorityTotal;
    bestStrategy = "Weekly Priority";
  }

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

  let breakdownParts: string[] = [];
  if (bestStrategy === "Nightly") {
    breakdownParts.push(`${nights} night(s) at ${rate.nightly.toFixed(2)} ${pricingConfig.currency}/night`);
  } else if (bestStrategy === "Weekly Priority") {
    if (weeks > 0) breakdownParts.push(`${weeks} week(s) at ${rate.weekly.toFixed(2)} ${pricingConfig.currency}/week`);
    if (remainingNightsAfterWeeks > 0) breakdownParts.push(`${remainingNightsAfterWeeks} night(s) at ${rate.nightly.toFixed(2)} ${pricingConfig.currency}/night`);
  } else if (bestStrategy === "Monthly Priority") {
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

export async function updateBookingAndInvoiceDetails(
  bookingId: string,
  details: EditableBookingInvoiceFormValues
) {
  try {
    const bookingRef = doc(db, "bookingRequests", bookingId);
    const dataToUpdate = {
      name: details.name,
      email: details.invoiceRecipientEmail, 
      checkInDate: Timestamp.fromDate(new Date(details.checkInDate)),
      checkOutDate: Timestamp.fromDate(new Date(details.checkOutDate)),
      guests: Number(details.guests),
      finalInvoiceAmount: Number(details.finalInvoiceAmount),
      finalInvoiceCurrency: details.finalInvoiceCurrency,
      finalInvoiceBreakdown: details.finalInvoiceBreakdown,
      finalInvoiceStrategy: details.finalInvoiceStrategy,
      invoiceUpdatedAt: serverTimestamp(),
    };

    await updateDoc(bookingRef, dataToUpdate);
    console.log(`Booking ${bookingId} details and invoice finalized.`);
    return { success: true, message: "Booking details and invoice information updated successfully." };
  } catch (error) {
    console.error("Error updating booking and invoice details: ", error);
    return { success: false, message: "Failed to update booking and invoice details." };
  }
}

export async function addManualCalendarEntry(data: ManualCalendarEntryFormValues) {
  console.log("Manual calendar entry received:", data);
  try {
    const entryData: any = {
      entryName: data.entryName, 
      name: data.entryName, 
      checkInDate: Timestamp.fromDate(data.checkInDate),
      checkOutDate: Timestamp.fromDate(data.checkOutDate),
      status: data.entryType === 'manual_booking' ? 'manual_confirmed' : 'blocked',
      notes: data.notes || "",
      createdAt: serverTimestamp(),
      email: data.entryType === 'manual_booking' ? 'manual@example.com' : 'blocked@internal.com',
      guests: data.entryType === 'manual_booking' ? 1 : 0,
    };

    const docRef = await addDoc(collection(db, "bookingRequests"), entryData);
    console.log("Manual calendar entry written with ID: ", docRef.id);

    return {
      success: true,
      message: `Calendar entry "${data.entryName}" added successfully as type: ${data.entryType}.`,
      id: docRef.id,
    };
  } catch (error) {
    console.error("Error adding manual calendar entry to Firestore: ", error);
    return {
      success: false,
      message: "We encountered an issue adding your calendar entry. Please try again.",
    };
  }
}

export async function updateManualCalendarEntry(entryId: string, data: ManualCalendarEntryFormValues) {
  console.log("Updating manual calendar entry:", entryId, data);
  try {
    const entryRef = doc(db, "bookingRequests", entryId);
    const entryData: any = {
      entryName: data.entryName,
      name: data.entryName, 
      checkInDate: Timestamp.fromDate(data.checkInDate),
      checkOutDate: Timestamp.fromDate(data.checkOutDate),
      status: data.entryType === 'manual_booking' ? 'manual_confirmed' : 'blocked',
      notes: data.notes || "",
      updatedAt: serverTimestamp(),
      // Preserve email and guests if appropriate for the type, or reset
      email: data.entryType === 'manual_booking' ? 'manual@example.com' : 'blocked@internal.com',
      guests: data.entryType === 'manual_booking' ? 1 : 0,
    };

    await updateDoc(entryRef, entryData);
    console.log(`Manual calendar entry ${entryId} updated.`);
    return {
      success: true,
      message: `Calendar entry "${data.entryName}" updated successfully.`,
    };
  } catch (error) {
    console.error("Error updating manual calendar entry: ", error);
    return {
      success: false,
      message: "Failed to update calendar entry.",
    };
  }
}

    