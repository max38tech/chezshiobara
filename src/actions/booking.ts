
"use server";

import type { BookingRequestFormValues, EditableBookingInvoiceFormValues, ManualCalendarEntryFormValues } from "@/schemas/booking";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDocs, query, where, Timestamp, deleteDoc } from "firebase/firestore";
import { differenceInDays, format as formatDateFn } from 'date-fns';
import type { ClientSafePricingConfiguration } from '@/actions/pricing';
import { getPaymentSettings, type PaymentSettings } from '@/actions/payment'; // Import getPaymentSettings
import nodemailer from "nodemailer";

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
    const requestsCollection = collection(db, 'bookingRequests');
    const q = query(requestsCollection, where('status', 'in', ['confirmed', 'blocked', 'manual_booking', 'paid', 'manual_confirmed']));
    const querySnapshot = await getDocs(q);

    const events = querySnapshot.docs.map(docSnapshot => {
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

async function sendPaymentLinkEmail(bookingId: string, details: EditableBookingInvoiceFormValues, paymentSettings: PaymentSettings): Promise<{ success: boolean; message: string }> {
  console.log(`[sendPaymentLinkEmail] Attempting to send email for booking ID: ${bookingId}`);

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("[sendPaymentLinkEmail] Email credentials (EMAIL_USER, EMAIL_PASS) not set. Skipping payment link email.");
    return { success: false, message: "Email not sent: Server email configuration missing." };
  }
  if (!details.invoiceRecipientEmail) {
    console.warn(`[sendPaymentLinkEmail] No invoice recipient email provided for booking: ${bookingId}. Skipping email.`);
    return { success: false, message: "Email not sent: Recipient email missing." };
  }

  let baseUrl: string;
  const runtimeNodeEnv = process.env.NODE_ENV;
  const nextPublicBaseUrl = process.env.NEXT_PUBLIC_BASE_URL; 

  console.log(`[sendPaymentLinkEmail] Initial environment check: Runtime NODE_ENV='${runtimeNodeEnv}', Build-time NEXT_PUBLIC_BASE_URL (available at runtime)='${nextPublicBaseUrl}'`);

  if (runtimeNodeEnv === 'production') {
    baseUrl = 'https://chezshiobara.com';
    console.log(`[sendPaymentLinkEmail] Condition: runtimeNodeEnv === 'production'. Using hardcoded production URL: ${baseUrl}`);
  } else {
    if (nextPublicBaseUrl && (nextPublicBaseUrl.startsWith('http://') || nextPublicBaseUrl.startsWith('https://'))) {
      baseUrl = nextPublicBaseUrl;
      console.log(`[sendPaymentLinkEmail] Condition: runtimeNodeEnv !== 'production'. Using NEXT_PUBLIC_BASE_URL (from build): ${baseUrl}`);
    } else {
      baseUrl = 'http://localhost:9002'; 
      console.log(`[sendPaymentLinkEmail] Condition: runtimeNodeEnv !== 'production' AND NEXT_PUBLIC_BASE_URL (from build) invalid or missing. Using default dev URL: ${baseUrl}`);
    }
  }
  
  console.log(`[sendPaymentLinkEmail] Final base URL for payment link: ${baseUrl}. Booking ID: ${bookingId}.`);
  const stripePaymentLink = `${baseUrl}/checkout/${bookingId}`;

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  let paymentOptionsHtml = "";

  if (paymentSettings.isCardPaymentEnabled) {
    paymentOptionsHtml += `
      <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9;">
        <h4 style="margin-top: 0; margin-bottom: 10px; font-size: 1.1em; color: #333;">Pay by Credit/Debit Card (Securely via Stripe)</h4>
        <p style="margin-bottom: 10px;">For quick and secure payment, please use the button below:</p>
        <p style="margin-bottom: 10px;">
          <a href="${stripePaymentLink}" target="_blank" style="background-color: #7FFFD4; color: #2F4F4F; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Pay with Card Now</a>
        </p>
        <p style="font-size: 0.9em;">Or copy and paste this URL into your browser: <a href="${stripePaymentLink}" target="_blank">${stripePaymentLink}</a></p>
        ${paymentSettings.cardPaymentInstructions ? `<p style="font-size: 0.85em; color: #555; margin-top: 10px; white-space: pre-wrap;"><em>${paymentSettings.cardPaymentInstructions}</em></p>` : ''}
      </div>
    `;
  }

  if (paymentSettings.isPaypalEnabled && paymentSettings.paypalEmailOrLink) {
    paymentOptionsHtml += `
      <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9;">
        <h4 style="margin-top: 0; margin-bottom: 10px; font-size: 1.1em; color: #333;">Pay with PayPal</h4>
        <p style="margin-bottom: 5px;">You can send your payment to the following PayPal account/link:</p>
        <p style="margin-bottom: 10px; font-weight: bold;">${paymentSettings.paypalEmailOrLink}</p>
        <p style="font-size: 0.9em;">Please include your Booking ID <strong>(${bookingId})</strong> in the payment notes or reference.</p>
      </div>
    `;
  }

  if (paymentSettings.isWiseEnabled && paymentSettings.wiseInstructions) {
    paymentOptionsHtml += `
      <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9;">
        <h4 style="margin-top: 0; margin-bottom: 10px; font-size: 1.1em; color: #333;">Pay with Wise (formerly TransferWise)</h4>
        <p style="margin-bottom: 10px;">For Wise payments, please use the following details:</p>
        <div style="background-color: #fff; border: 1px solid #eee; padding: 10px; border-radius: 4px; white-space: pre-wrap; font-family: monospace; font-size: 0.95em;">${paymentSettings.wiseInstructions.replace(/\n/g, '<br>')}</div>
        <p style="font-size: 0.9em; margin-top: 10px;">Please include your Booking ID <strong>(${bookingId})</strong> in the payment reference.</p>
      </div>
    `;
  }
  
  if (paymentOptionsHtml === "") {
    paymentOptionsHtml = "<p>Please contact us directly to arrange payment, as no online payment methods are currently configured.</p>";
  }


  const mailOptions = {
    from: `"Chez Shiobara B&B" <${process.env.EMAIL_USER}>`,
    to: details.invoiceRecipientEmail,
    subject: `Your Booking Confirmation & Payment Options - Chez Shiobara B&B (Booking ID: ${bookingId})`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #257431; text-align: center;">Booking Confirmed & Payment Due</h2>
        <p>Dear ${details.name},</p>
        <p>Thank you for your booking with Chez Shiobara B&B! Your stay has been confirmed, and the invoice details are finalized.</p>

        <div style="padding: 10px; background-color: #f0f8ff; border-left: 4px solid #7FFFD4; margin-bottom: 20px;">
          <h3 style="margin-top: 0; color: #2F4F4F;">Booking Summary:</h3>
          <ul style="list-style-type: none; padding-left: 0;">
            <li><strong>Guest Name:</strong> ${details.name}</li>
            <li><strong>Check-in Date:</strong> ${formatDateFn(new Date(details.checkInDate), 'PPP')}</li>
            <li><strong>Check-out Date:</strong> ${formatDateFn(new Date(details.checkOutDate), 'PPP')}</li>
            <li><strong>Number of Guests:</strong> ${details.guests}</li>
          </ul>
        </div>

        <div style="padding: 10px; background-color: #fffaf0; border-left: 4px solid #ffdab9; margin-bottom: 20px;">
          <h3 style="margin-top: 0; color: #8B4513;">Payment Information:</h3>
          <p><strong>Amount Due:</strong> ${details.finalInvoiceAmount.toFixed(2)} ${details.finalInvoiceCurrency || 'USD'}</p>
          <p><strong>Payment Breakdown:</strong> ${details.finalInvoiceBreakdown || 'As per agreed rate'}</p>
        </div>
        
        <h3 style="color: #257431;">Payment Options:</h3>
        ${paymentOptionsHtml}

        <p style="margin-top: 25px;">If you have any questions or have made a payment via PayPal or Wise, please reply to this email to let us know.</p>
        <p>We look forward to welcoming you!</p>
        <br>
        <p>Best regards,</p>
        <p>The Chez Shiobara Team</p>
        <p style="font-size: 0.8em; text-align: center; margin-top: 20px; color: #777;">
          Chez Shiobara B&B | 16-7 Karasawa, Minami-ku, Yokohama, Kanagawa 232-0034, Japan
        </p>
      </div>
    `,
  };

  try {
    console.log(`[sendPaymentLinkEmail] Sending email to: ${details.invoiceRecipientEmail} for booking ${bookingId} with subject: ${mailOptions.subject}`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`[sendPaymentLinkEmail] Payment link email sent successfully to ${details.invoiceRecipientEmail} for booking ${bookingId}. Message ID: ${info.messageId}`);
    return { success: true, message: "Payment options email sent successfully." };
  } catch (error) {
    console.error(`[sendPaymentLinkEmail] Error sending payment link email for booking ${bookingId}:`, error);
    return { success: false, message: `Failed to send payment options email: ${error instanceof Error ? error.message : "Unknown email error"}` };
  }
}


export async function updateBookingAndInvoiceDetails(
  bookingId: string,
  details: EditableBookingInvoiceFormValues
): Promise<{ success: boolean; message: string }> {
  console.log(`[updateBookingAndInvoiceDetails] Attempting to update booking ID: ${bookingId} with details:`, JSON.stringify(details, null, 2));
  try {
    const bookingRef = doc(db, "bookingRequests", bookingId);
    const dataToUpdate: any = {
      name: details.name,
      email: details.invoiceRecipientEmail, // Keep original requestor email if needed, or update main email
      checkInDate: Timestamp.fromDate(new Date(details.checkInDate)),
      checkOutDate: Timestamp.fromDate(new Date(details.checkOutDate)),
      guests: Number(details.guests),
      finalInvoiceAmount: Number(details.finalInvoiceAmount),
      finalInvoiceCurrency: details.finalInvoiceCurrency,
      finalInvoiceBreakdown: details.finalInvoiceBreakdown,
      finalInvoiceStrategy: details.finalInvoiceStrategy,
      invoiceRecipientEmail: details.invoiceRecipientEmail,
      invoiceUpdatedAt: serverTimestamp(),
    };

    const currentBookingSnap = await getDoc(bookingRef);
    if (!currentBookingSnap.exists()) {
      throw new Error("Booking document not found for update.");
    }
    const currentBookingData = currentBookingSnap.data();
    // Only update status to 'confirmed' if it's currently 'pending' or not already 'paid'
    if (currentBookingData.status === 'pending' || (currentBookingData.status !== 'paid' && currentBookingData.status !== 'manual_confirmed')) {
      dataToUpdate.status = 'confirmed';
    } else if (currentBookingData.status === 'manual_booking') { // If it was a manual booking, set to manual_confirmed
        dataToUpdate.status = 'manual_confirmed';
    }


    await updateDoc(bookingRef, dataToUpdate);
    console.log(`[updateBookingAndInvoiceDetails] Booking ${bookingId} details and invoice finalized in Firestore. Status set/updated to: ${dataToUpdate.status || currentBookingData.status}`);
    
    const paymentSettings = await getPaymentSettings(); // Fetch current payment settings

    let emailStatusMessage = "Email status: Unknown.";
    if (details.invoiceRecipientEmail) {
        // Pass paymentSettings to sendPaymentLinkEmail
        const emailResult = await sendPaymentLinkEmail(bookingId, details, paymentSettings); 
        emailStatusMessage = emailResult.message;
    } else {
        emailStatusMessage = "Email not sent: No recipient email provided in form.";
        console.warn(`[updateBookingAndInvoiceDetails] Email not sent for booking ${bookingId} because invoiceRecipientEmail was empty.`);
    }
    console.log(`[updateBookingAndInvoiceDetails] Email status for booking ${bookingId}: ${emailStatusMessage}`);

    return {
        success: true,
        message: `Booking & Invoice updated. ${emailStatusMessage}`
    };
  } catch (error) {
    console.error("[updateBookingAndInvoiceDetails] Error updating booking and invoice details: ", error);
    return { success: false, message: `Failed to update booking and invoice details. ${error instanceof Error ? error.message : "Unknown error"}` };
  }
}

export async function addManualCalendarEntry(data: ManualCalendarEntryFormValues) {
  console.log("Manual calendar entry received:", data);
  try {
    const entryData: any = {
      entryName: data.entryName,
      name: data.entryName, // For consistency if 'name' is used elsewhere
      checkInDate: Timestamp.fromDate(data.checkInDate),
      checkOutDate: Timestamp.fromDate(data.checkOutDate),
      status: data.entryType === 'manual_booking' ? 'manual_confirmed' : 'blocked', // Set manual_booking to manual_confirmed initially
      notes: data.notes || "",
      createdAt: serverTimestamp(),
      email: data.entryType === 'manual_booking' ? 'manual@example.com' : 'blocked@internal.com', // Placeholder emails
      guests: data.entryType === 'manual_booking' ? 1 : 0, // Default guests for manual booking
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

export async function deleteCalendarEntry(entryId: string): Promise<{ success: boolean; message: string }> {
  console.log(`[deleteCalendarEntry] Attempting to delete calendar entry ID: ${entryId}`);
  try {
    const entryRef = doc(db, "bookingRequests", entryId);
    await deleteDoc(entryRef);
    console.log(`[deleteCalendarEntry] Calendar entry ${entryId} deleted successfully from Firestore.`);
    return { success: true, message: "Calendar entry deleted successfully." };
  } catch (error) {
    console.error(`[deleteCalendarEntry] Error deleting calendar entry ${entryId}: `, error);
    return { success: false, message: `Failed to delete calendar entry. ${error instanceof Error ? error.message : "Unknown error"}` };
  }
}
    

      

    
