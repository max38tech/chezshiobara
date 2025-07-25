"use server";

import type { BookingRequestFormValues, EditableBookingInvoiceFormValues, ManualCalendarEntryFormValues } from "@/schemas/booking";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue, Timestamp, QueryDocumentSnapshot } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";
import { differenceInDays, format as formatDateFn } from 'date-fns';
import type { ClientSafePricingConfiguration } from '@/actions/pricing';
import { getPaymentSettings, type PaymentSettings } from '@/actions/payment';
import nodemailer from "nodemailer";
import { getInvoiceEmailContent } from '@/actions/content';

export async function handleBookingRequest(data: BookingRequestFormValues) {
  if (!adminDb) {
    console.error("Firebase Admin is not initialized. Cannot submit booking request.");
    return { success: false, message: "Database connection not available." };
  }
  try {
    const bookingData = {
      ...data,
      guests: Number(data.guests),
      createdAt: FieldValue.serverTimestamp(),
      status: "pending",
    };

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
  if (!adminDb) {
    console.error("Firebase Admin is not initialized. Cannot approve booking request.");
    return { success: false, message: "Database connection not available." };
  }
  try {
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
  if (!adminDb) {
    console.error("Firebase Admin is not initialized. Cannot deny booking request.");
    return { success: false, message: "Database connection not available." };
  }
  try {
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
  if (!adminDb) {
    console.error("Firebase Admin is not initialized. Cannot get calendar events.");
    return [];
  }
  try {
    const requestsCollection = adminDb.collection('bookingRequests');
    const q = requestsCollection.where('status', 'in', ['confirmed', 'blocked', 'manual_booking', 'paid', 'manual_confirmed']);
    const querySnapshot = await q.get();

    const events = querySnapshot.docs.map((docSnapshot: QueryDocumentSnapshot) => {
      const data = docSnapshot.data();
      let entryType: CalendarEvent['entryType'] | undefined = undefined;
      if (data.status === 'blocked') entryType = 'blocked';
      else if (data.status === 'manual_booking' || data.status === 'manual_confirmed') entryType = 'manual_booking';
      
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

export async function calculateInvoiceDetails(
  bookingDetails: { checkInDate: Date; checkOutDate: Date; guests: number; },
  pricingConfig: ClientSafePricingConfiguration
) {
  // This function does not use Firebase, no changes needed.
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

async function sendPaymentLinkEmail(bookingId: string, details: EditableBookingInvoiceFormValues, paymentSettings: PaymentSettings): Promise<{ success: boolean; message: string }> {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return { success: false, message: "Email not sent: Server email configuration missing." };
  }
  if (!details.invoiceRecipientEmail) {
    return { success: false, message: "Email not sent: Recipient email missing." };
  }

  try {
    const emailTemplate = await getInvoiceEmailContent();
    const baseUrl = process.env.NODE_ENV === 'production' ? 'https://chezshiobara.com' : (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002');
    const stripePaymentLink = `${baseUrl}/checkout/${bookingId}`;

    let paymentOptionsHtml = "";
    if (paymentSettings.isCardPaymentEnabled) paymentOptionsHtml += `<div><h4>Pay by Credit/Debit Card</h4><p><a href="${stripePaymentLink}">Click here to pay with your card</a></p></div>`;
    if (paymentSettings.isPaypalEnabled && paymentSettings.paypalEmailOrLink) paymentOptionsHtml += `<div><h4>Pay with PayPal</h4><p>You can send payment to: ${paymentSettings.paypalEmailOrLink}</p></div>`;
    if (paymentSettings.isWiseEnabled && paymentSettings.wiseInstructions) paymentOptionsHtml += `<div><h4>Pay with Wise</h4><div>${paymentSettings.wiseInstructions.replace(/\n/g, '<br>')}</div></div>`;
    if (paymentOptionsHtml === "") paymentOptionsHtml = "<p>Please contact us to arrange payment.</p>";

    const subject = emailTemplate.subject.replace(/{{bookingId}}/g, bookingId).replace(/{{name}}/g, details.name);
    const body = emailTemplate.body
      .replace(/{{bookingId}}/g, bookingId)
      .replace(/{{name}}/g, details.name)
      .replace(/{{checkInDate}}/g, formatDateFn(new Date(details.checkInDate), 'PPP'))
      .replace(/{{checkOutDate}}/g, formatDateFn(new Date(details.checkOutDate), 'PPP'))
      .replace(/{{guests}}/g, details.guests.toString())
      .replace(/{{totalAmount}}/g, `${details.finalInvoiceAmount.toFixed(2)} ${details.finalInvoiceCurrency || 'USD'}`)
      .replace(/{{paymentOptions}}/g, paymentOptionsHtml);

    const transporter = nodemailer.createTransport({ host: "smtp.gmail.com", port: 465, secure: true, auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }});
    
    const mailOptions = { 
      from: `"Chez Shiobara B&B" <${process.env.EMAIL_USER}>`, 
      to: details.invoiceRecipientEmail, 
      subject: subject, 
      html: body
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: "Payment options email sent." };
  } catch (error) {
    console.error("Error in sendPaymentLinkEmail:", error);
    return { success: false, message: `Failed to send email: ${error instanceof Error ? error.message : "Unknown error"}` };
  }
}

export async function updateBookingAndInvoiceDetails(
  bookingId: string,
  details: EditableBookingInvoiceFormValues
): Promise<{ success: boolean; message: string }> {
  if (!adminDb) {
    console.error("Firebase Admin is not initialized. Cannot update booking details.");
    return { success: false, message: "Database connection not available." };
  }
  try {
    const bookingRef = adminDb.collection("bookingRequests").doc(bookingId);
    
    // 👇 THIS IS THE FIX. Use .get() on the reference, not a separate getDoc() function.
    const currentBookingSnap = await bookingRef.get();
    
    if (!currentBookingSnap.exists) {
      throw new Error("Booking document not found.");
    }
    const currentBookingData = currentBookingSnap.data()!;
    
    const dataToUpdate: any = {
      name: details.name,
      email: details.invoiceRecipientEmail,
      checkInDate: Timestamp.fromDate(new Date(details.checkInDate)),
      checkOutDate: Timestamp.fromDate(new Date(details.checkOutDate)),
      guests: Number(details.guests),
      finalInvoiceAmount: Number(details.finalInvoiceAmount),
      finalInvoiceCurrency: details.finalInvoiceCurrency,
      finalInvoiceBreakdown: details.finalInvoiceBreakdown,
      finalInvoiceStrategy: details.finalInvoiceStrategy,
      invoiceRecipientEmail: details.invoiceRecipientEmail,
      invoiceUpdatedAt: FieldValue.serverTimestamp(),
    };

    if (currentBookingData.status === 'pending' || (currentBookingData.status !== 'paid' && currentBookingData.status !== 'manual_confirmed')) {
      dataToUpdate.status = 'confirmed';
    } else if (currentBookingData.status === 'manual_booking') {
      dataToUpdate.status = 'manual_confirmed';
    }

    await bookingRef.update(dataToUpdate);
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
  if (!adminDb) {
    console.error("Firebase Admin is not initialized. Cannot add manual entry.");
    return { success: false, message: "Database connection not available." };
  }
  try {
    const entryData: any = {
      entryName: data.entryName,
      name: data.entryName,
      checkInDate: Timestamp.fromDate(data.checkInDate),
      checkOutDate: Timestamp.fromDate(data.checkOutDate),
      status: data.entryType === 'manual_booking' ? 'manual_confirmed' : 'blocked',
      notes: data.notes || "",
      createdAt: FieldValue.serverTimestamp(),
      email: data.entryType === 'manual_booking' ? 'manual@example.com' : 'blocked@internal.com',
      guests: data.entryType === 'manual_booking' ? 1 : 0,
    };

    const docRef = await adminDb.collection("bookingRequests").add(entryData);
    revalidatePath('/admin-dashboard');
    return { success: true, message: `Entry "${data.entryName}" added.`, id: docRef.id };
  } catch (error) {
    return { success: false, message: "Failed to add entry." };
  }
}

export async function updateManualCalendarEntry(entryId: string, data: ManualCalendarEntryFormValues) {
  if (!adminDb) {
    console.error("Firebase Admin is not initialized. Cannot update manual entry.");
    return { success: false, message: "Database connection not available." };
  }
  try {
    const entryRef = adminDb.collection("bookingRequests").doc(entryId);
    const entryData: any = {
      entryName: data.entryName,
      name: data.entryName,
      checkInDate: Timestamp.fromDate(data.checkInDate),
      checkOutDate: Timestamp.fromDate(data.checkOutDate),
      status: data.entryType === 'manual_booking' ? 'manual_confirmed' : 'blocked',
      notes: data.notes || "",
      updatedAt: FieldValue.serverTimestamp(),
    };

    await entryRef.update(entryData);
    revalidatePath('/admin-dashboard');
    return { success: true, message: `Entry "${data.entryName}" updated.` };
  } catch (error) {
    return { success: false, message: "Failed to update entry." };
  }
}

export async function deleteManualCalendarEntry(entryId: string) {
  if (!adminDb) {
    console.error("Firebase Admin is not initialized. Cannot delete manual entry.");
    return { success: false, message: "Database connection not available." };
  }
  try {
    const entryRef = adminDb.collection("bookingRequests").doc(entryId);
    await entryRef.delete();
    revalidatePath('/admin-dashboard');
    return { success: true, message: "Entry deleted." };
  } catch (error) {
    return { success: false, message: `Failed to delete. ${error instanceof Error ? error.message : "Unknown error"}` };
  }
}

export async function sendFinalizedBookingEmail(bookingId: string, details: { name: string; checkInDate: string; checkOutDate: string; guests: number; invoiceRecipientEmail: string; totalAmount: string; }) {
  console.log("Attempting to send finalized booking email for booking ID:", bookingId);

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("Email credentials (EMAIL_USER, EMAIL_PASS) are not configured in .env.local");
    return { success: false, message: "Email server is not configured." };
  }

  try {
    const emailTemplate = await getInvoiceEmailContent();
    
    // Replace placeholders
    let subject = emailTemplate.subject.replace(/{{bookingId}}/g, bookingId);
    let body = emailTemplate.body
      .replace(/{{name}}/g, details.name)
      .replace(/{{checkInDate}}/g, formatDateFn(new Date(details.checkInDate), 'PPP'))
      .replace(/{{checkOutDate}}/g, formatDateFn(new Date(details.checkOutDate), 'PPP'))
      .replace(/{{guests}}/g, details.guests.toString())
      .replace(/{{totalAmount}}/g, details.totalAmount)
      .replace(/{{bookingId}}/g, bookingId)
      .replace(/{{paymentOptions}}/g, 'This should be replaced with actual payment options HTML');


    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Chez Shiobara B&B" <${process.env.EMAIL_USER}>`,
      to: details.invoiceRecipientEmail,
      subject: subject,
      html: body,
    };

    await transporter.sendMail(mailOptions);
    console.log("Finalized booking email sent successfully to:", details.invoiceRecipientEmail);
    return { success: true, message: "Email sent successfully." };
  } catch (error: any) {
    console.error("Failed to send finalized booking email:", error);
    // Check for authentication errors specifically
    if (error.code === 'EAUTH' || error.responseCode === 535) {
      return { success: false, message: "Failed to send email: Authentication failed. Please check your EMAIL_USER and EMAIL_PASS in the .env.local file." };
    }
    return { success: false, message: `Failed to send email: ${error.message}` };
  }
}

export async function getBookingRequests() {
  if (!adminDb) {
    console.error("Firebase Admin is not initialized. Cannot get booking requests.");
    return [];
  }
  try {
    const requestsCollection = adminDb.collection('bookingRequests');
    const snapshot = await requestsCollection.orderBy('checkInDate', 'asc').get();

    const bookingRequests = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return bookingRequests;
  } catch (error) {
    console.error("Error fetching booking requests: ", error);
    return [];
  }
}

export async function finalizeBooking(bookingId: string, finalDetails: { paymentMethod: string; totalAmount: string; invoiceRecipientEmail: string; }) {
  if (!adminDb) {
    console.error("Firebase Admin is not initialized. Cannot finalize booking.");
    return { success: false, message: "Database connection not available." };
  }
  try {
    const bookingRef = adminDb.collection("bookingRequests").doc(bookingId);
    const bookingSnap = await bookingRef.get();

    if (!bookingSnap.exists) {
      return { success: false, message: "Booking not found." };
    }

    await bookingRef.update({
      status: "paid",
      paymentMethod: finalDetails.paymentMethod,
      totalAmount: Number(finalDetails.totalAmount),
      invoiceRecipientEmail: finalDetails.invoiceRecipientEmail,
      finalizedAt: FieldValue.serverTimestamp(),
    });

    revalidatePath('/admin-dashboard');

    // Send confirmation email
    const emailDetails = {
      name: bookingSnap.data()?.name,
      checkInDate: bookingSnap.data()?.checkInDate,
      checkOutDate: bookingSnap.data()?.checkOutDate,
      guests: bookingSnap.data()?.guests,
      invoiceRecipientEmail: finalDetails.invoiceRecipientEmail,
      totalAmount: finalDetails.totalAmount,
    };

    await sendFinalizedBookingEmail(bookingId, emailDetails);

    return { success: true, message: "Booking finalized successfully." };
  } catch (error) {
    console.error("Error finalizing booking: ", error);
    return { success: false, message: "Failed to finalize booking." };
  }
}