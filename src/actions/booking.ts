// src/actions/booking.ts

"use server";

import type { BookingRequestFormValues, EditableBookingInvoiceFormValues, ManualCalendarEntryFormValues } from "@/schemas/booking";
// 🎯 CHANGE: Import the ADMIN database instance instead of the client one
import { adminDb } from "@/lib/firebase-admin"; 
import { FieldValue, Timestamp, QueryDocumentSnapshot, getDoc } from "firebase-admin/firestore"; // 🎯 CHANGE: Use admin SDK's Timestamp and serverTimestamp
import { revalidatePath } from "next/cache";
import { differenceInDays, format as formatDateFn } from 'date-fns';
import type { ClientSafePricingConfiguration } from '@/actions/pricing';
import { getPaymentSettings, type PaymentSettings } from '@/actions/payment';
import nodemailer from "nodemailer";

export async function handleBookingRequest(data: BookingRequestFormValues) {
  console.log("Booking request received:", data);

  try {
    const bookingData = {
      ...data,
      guests: Number(data.guests),
      createdAt: FieldValue.serverTimestamp(), // 🎯 CHANGE: Use admin FieldValue
      status: "pending",
    };

    // 🎯 CHANGE: Use adminDb
    const docRef = await adminDb.collection("bookingRequests").add(bookingData);
    console.log("Document written with ID: ", docRef.id);
    
    revalidatePath('/admin-dashboard');

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
    // 🎯 CHANGE: Use adminDb.doc() syntax
    const requestRef = adminDb.collection("bookingRequests").doc(requestId);
    await requestRef.update({
      status: "confirmed",
    });
    console.log(`Booking request ${requestId} approved.`);
    revalidatePath('/admin-dashboard');
    return { success: true, message: "Booking request approved successfully." };
  } catch (error) {
    console.error("Error approving booking request: ", error);
    return { success: false, message: "Failed to approve booking request." };
  }
}

export async function declineBookingRequest(requestId: string) {
  try {
    // 🎯 CHANGE: Use adminDb.doc() syntax
    const requestRef = adminDb.collection("bookingRequests").doc(requestId);
    await requestRef.update({
      status: "declined",
    });
    console.log(`Booking request ${requestId} declined.`);
    revalidatePath('/admin-dashboard');
    return { success: true, message: "Booking request declined successfully." };
  } catch (error) {
    console.error("Error declining booking request: ", error);
    return { success: false, message: "Failed to decline booking request." };
  }
}

export interface CalendarEvent {
  id: string;
  name: string;
  checkInDate: Date;
  checkOutDate: Date;
  status: 'confirmed' | 'blocked' | 'manual_booking' | 'paid' | 'manual_confirmed';
  notes?: string;
  entryType?: 'blocked' | 'manual_booking';
}

export async function getAllCalendarEvents(): Promise<CalendarEvent[]> {
  try {
    // 🎯 CHANGE: Use adminDb
    const requestsCollection = adminDb.collection('bookingRequests');
    const q = requestsCollection.where('status', 'in', ['confirmed', 'blocked', 'manual_booking', 'paid', 'manual_confirmed']);
    const querySnapshot = await q.get();

    const events = querySnapshot.docs.map((docSnapshot: QueryDocumentSnapshot) => {
      const data = docSnapshot.data();
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

// NO CHANGE NEEDED IN THIS FUNCTION
export async function calculateInvoiceDetails(
  bookingDetails: { checkInDate: Date; checkOutDate: Date; guests: number; },
  pricingConfig: ClientSafePricingConfiguration
) {
  const { checkInDate, checkOutDate, guests } = bookingDetails;
  const nights = differenceInDays(new Date(checkOutDate), new Date(checkInDate));
  if (nights <= 0) return { totalAmount: 0, currency: pricingConfig.currency, breakdown: "Invalid dates", appliedStrategy: "Error" };
  const rate = guests >= 2 ? { nightly: pricingConfig.perNight2People, weekly: pricingConfig.perWeek2People, monthly: pricingConfig.perMonth2People } : { nightly: pricingConfig.perNight1Person, weekly: pricingConfig.perWeek1Person, monthly: pricingConfig.perMonth1Person };
  const nightlyTotal = nights * rate.nightly;
  let bestTotal = nightlyTotal;
  let bestStrategy = "Nightly";
  const weeks = Math.floor(nights / 7);
  const remainingNightsAfterWeeks = nights % 7;
  const weeklyPriorityTotal = (weeks * rate.weekly) + (remainingNightsAfterWeeks * rate.nightly);
  if (weeklyPriorityTotal < bestTotal) { bestTotal = weeklyPriorityTotal; bestStrategy = "Weekly Priority"; }
  const months = Math.floor(nights / 30);
  const remainingNightsAfterMonths = nights % 30;
  const remainingWeeksAfterMonths = Math.floor(remainingNightsAfterMonths / 7);
  const finalRemainingNights = remainingNightsAfterMonths % 7;
  const monthlyPriorityTotal = (months * rate.monthly) + (remainingWeeksAfterMonths * rate.weekly) + (finalRemainingNights * rate.nightly);
  if (monthlyPriorityTotal < bestTotal) { bestTotal = monthlyPriorityTotal; bestStrategy = "Monthly Priority"; }
  let breakdownParts: string[] = [];
  if (bestStrategy === "Nightly") breakdownParts.push(`${nights}n @ ${rate.nightly.toFixed(2)}`);
  else if (bestStrategy === "Weekly Priority") { if (weeks > 0) breakdownParts.push(`${weeks}w @ ${rate.weekly.toFixed(2)}`); if (remainingNightsAfterWeeks > 0) breakdownParts.push(`${remainingNightsAfterWeeks}n @ ${rate.nightly.toFixed(2)}`); }
  else if (bestStrategy === "Monthly Priority") { if (months > 0) breakdownParts.push(`${months}m @ ${rate.monthly.toFixed(2)}`); if (remainingWeeksAfterMonths > 0) breakdownParts.push(`${remainingWeeksAfterMonths}w @ ${rate.weekly.toFixed(2)}`); if (finalRemainingNights > 0) breakdownParts.push(`${finalRemainingNights}n @ ${rate.nightly.toFixed(2)}`); }
  return { totalAmount: parseFloat(bestTotal.toFixed(2)), currency: pricingConfig.currency, breakdown: `Calc: ${breakdownParts.join(' + ')}`, appliedStrategy: bestStrategy };
}

// NO CHANGE NEEDED IN THIS FUNCTION
async function sendPaymentLinkEmail(bookingId: string, details: EditableBookingInvoiceFormValues, paymentSettings: PaymentSettings): Promise<{ success: boolean; message: string }> {
  // This function does not interact with Firestore, so it remains unchanged.
  // All its logic for sending email is correct.
  console.log(`[sendPaymentLinkEmail] Attempting to send email for booking ID: ${bookingId}`);
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("[sendPaymentLinkEmail] Email credentials not set. Skipping email.");
    return { success: false, message: "Email not sent: Server email configuration missing." };
  }
  if (!details.invoiceRecipientEmail) {
    console.warn(`[sendPaymentLinkEmail] No recipient email. Skipping email.`);
    return { success: false, message: "Email not sent: Recipient email missing." };
  }
  const baseUrl = process.env.NODE_ENV === 'production' ? 'https://chezshiobara.com' : (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002');
  const stripePaymentLink = `${baseUrl}/checkout/${bookingId}`;
  const transporter = nodemailer.createTransport({ host: "smtp.gmail.com", port: 465, secure: true, auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }});
  let paymentOptionsHtml = "";
  if (paymentSettings.isCardPaymentEnabled) paymentOptionsHtml += `<div><h4>Pay by Credit/Debit Card</h4><p><a href="${stripePaymentLink}">Pay with Card Now</a></p><p>URL: ${stripePaymentLink}</p></div>`;
  if (paymentSettings.isPaypalEnabled && paymentSettings.paypalEmailOrLink) paymentOptionsHtml += `<div><h4>Pay with PayPal</h4><p>${paymentSettings.paypalEmailOrLink}</p></div>`;
  if (paymentSettings.isWiseEnabled && paymentSettings.wiseInstructions) paymentOptionsHtml += `<div><h4>Pay with Wise</h4><div>${paymentSettings.wiseInstructions.replace(/\n/g, '<br>')}</div></div>`;
  if (paymentOptionsHtml === "") paymentOptionsHtml = "<p>Contact us to arrange payment.</p>";
  const mailOptions = { from: `"Chez Shiobara B&B" <${process.env.EMAIL_USER}>`, to: details.invoiceRecipientEmail, subject: `Booking Confirmation & Payment - Chez Shiobara (ID: ${bookingId})`, html: `<div><h2>Booking Confirmed</h2><p>Dear ${details.name},</p><p>Your stay is confirmed.</p><div><h3>Booking Summary:</h3><ul><li>Name: ${details.name}</li><li>Check-in: ${formatDateFn(new Date(details.checkInDate), 'PPP')}</li><li>Check-out: ${formatDateFn(new Date(details.checkOutDate), 'PPP')}</li><li>Guests: ${details.guests}</li></ul></div><div><h3>Payment Info:</h3><p>Amount: ${details.finalInvoiceAmount.toFixed(2)} ${details.finalInvoiceCurrency || 'USD'}</p><p>Breakdown: ${details.finalInvoiceBreakdown || 'N/A'}</p></div><h3>Payment Options:</h3>${paymentOptionsHtml}<p>We look forward to welcoming you!</p></div>`};
  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: "Payment options email sent." };
  } catch (error) {
    return { success: false, message: `Failed to send email: ${error instanceof Error ? error.message : "Unknown error"}` };
  }
}

export async function updateBookingAndInvoiceDetails(
  bookingId: string,
  details: EditableBookingInvoiceFormValues
): Promise<{ success: boolean; message: string }> {
  console.log(`[updateBookingAndInvoiceDetails] Attempting update for ID: ${bookingId}`);
  try {
    // 🎯 CHANGE: Use adminDb.doc() syntax
    const bookingRef = adminDb.collection("bookingRequests").doc(bookingId);
    const dataToUpdate: any = {
      name: details.name,
      email: details.invoiceRecipientEmail,
      checkInDate: Timestamp.fromDate(new Date(details.checkInDate)), // 🎯 CHANGE: Use admin Timestamp
      checkOutDate: Timestamp.fromDate(new Date(details.checkOutDate)), // 🎯 CHANGE: Use admin Timestamp
      guests: Number(details.guests),
      finalInvoiceAmount: Number(details.finalInvoiceAmount),
      finalInvoiceCurrency: details.finalInvoiceCurrency,
      finalInvoiceBreakdown: details.finalInvoiceBreakdown,
      finalInvoiceStrategy: details.finalInvoiceStrategy,
      invoiceRecipientEmail: details.invoiceRecipientEmail,
      invoiceUpdatedAt: FieldValue.serverTimestamp(), // 🎯 CHANGE: Use admin FieldValue
    };

    const currentBookingSnap = await bookingRef.get();
    if (!currentBookingSnap.exists) {
      throw new Error("Booking document not found.");
    }
    const currentBookingData = currentBookingSnap.data()!;
    if (currentBookingData.status === 'pending' || (currentBookingData.status !== 'paid' && currentBookingData.status !== 'manual_confirmed')) {
      dataToUpdate.status = 'confirmed';
    } else if (currentBookingData.status === 'manual_booking') {
      dataToUpdate.status = 'manual_confirmed';
    }

    await bookingRef.update(dataToUpdate); // This now uses the admin SDK and will succeed
    console.log(`[updateBookingAndInvoiceDetails] Firestore updated for ${bookingId}.`);
    
    revalidatePath('/admin-dashboard');
    const paymentSettings = await getPaymentSettings();
    let emailStatusMessage = "";
    if (details.invoiceRecipientEmail) {
        const emailResult = await sendPaymentLinkEmail(bookingId, details, paymentSettings); 
        emailStatusMessage = emailResult.message;
    } else {
        emailStatusMessage = "Email not sent (no recipient).";
    }

    return { success: true, message: `Booking updated. ${emailStatusMessage}` };
  } catch (error) {
    console.error("[updateBookingAndInvoiceDetails] Error:", error);
    return { success: false, message: `Failed to update. ${error instanceof Error ? error.message : "Unknown error"}` };
  }
}

export async function addManualCalendarEntry(data: ManualCalendarEntryFormValues) {
  try {
    const entryData: any = {
      entryName: data.entryName,
      name: data.entryName,
      checkInDate: Timestamp.fromDate(data.checkInDate), // 🎯 CHANGE
      checkOutDate: Timestamp.fromDate(data.checkOutDate), // 🎯 CHANGE
      status: data.entryType === 'manual_booking' ? 'manual_confirmed' : 'blocked',
      notes: data.notes || "",
      createdAt: FieldValue.serverTimestamp(), // 🎯 CHANGE
      email: data.entryType === 'manual_booking' ? 'manual@example.com' : 'blocked@internal.com',
      guests: data.entryType === 'manual_booking' ? 1 : 0,
    };

    // 🎯 CHANGE: Use adminDb
    const docRef = await adminDb.collection("bookingRequests").add(entryData);
    revalidatePath('/admin-dashboard');
    return { success: true, message: `Entry "${data.entryName}" added.`, id: docRef.id };
  } catch (error) {
    return { success: false, message: "Failed to add entry." };
  }
}

export async function updateManualCalendarEntry(entryId: string, data: ManualCalendarEntryFormValues) {
  try {
    // 🎯 CHANGE: Use adminDb.doc() syntax
    const entryRef = adminDb.collection("bookingRequests").doc(entryId);
    const entryData: any = {
      entryName: data.entryName,
      name: data.entryName,
      checkInDate: Timestamp.fromDate(data.checkInDate), // 🎯 CHANGE
      checkOutDate: Timestamp.fromDate(data.checkOutDate), // 🎯 CHANGE
      status: data.entryType === 'manual_booking' ? 'manual_confirmed' : 'blocked',
      notes: data.notes || "",
      updatedAt: FieldValue.serverTimestamp(), // 🎯 CHANGE
    };

    await entryRef.update(entryData);
    revalidatePath('/admin-dashboard');
    return { success: true, message: `Entry "${data.entryName}" updated.` };
  } catch (error) {
    return { success: false, message: "Failed to update entry." };
  }
}

export async function deleteCalendarEntry(entryId: string): Promise<{ success: boolean; message: string }> {
  try {
    // 🎯 CHANGE: Use adminDb.doc() syntax
    const entryRef = adminDb.collection("bookingRequests").doc(entryId);
    await entryRef.delete();
    revalidatePath('/admin-dashboard');
    return { success: true, message: "Entry deleted." };
  } catch (error) {
    return { success: false, message: `Failed to delete. ${error instanceof Error ? error.message : "Unknown error"}` };
  }
}
