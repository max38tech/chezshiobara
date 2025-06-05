
"use server";

import Stripe from 'stripe';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { BookingRequest } from '@/components/specific/admin/booking-requests-table'; 

interface CreateCheckoutSessionResponse {
  sessionId?: string;
  error?: string;
}

export async function createCheckoutSession(bookingId: string): Promise<CreateCheckoutSessionResponse> {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("Stripe secret key is not configured.");
    return { error: "Payment processing is not configured correctly. STRIPE_SECRET_KEY missing." };
  }
  if (!bookingId) {
    return { error: "Booking ID is required." };
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-06-20', 
  });

  try {
    const bookingDocRef = doc(db, "bookingRequests", bookingId);
    const bookingSnap = await getDoc(bookingDocRef);

    if (!bookingSnap.exists()) {
      return { error: "Booking not found." };
    }

    const bookingData = bookingSnap.data() as BookingRequest; // Assuming BookingRequest includes all needed fields

    const allowedStatusesForPayment: BookingRequest['status'][] = ['confirmed', 'manual_confirmed'];
    if (!allowedStatusesForPayment.includes(bookingData.status)) {
        return { error: `Booking must be in a 'confirmed' or 'manual_confirmed' state to proceed with payment. Current status: ${bookingData.status}.` };
    }

    const amount = bookingData.finalInvoiceAmount;
    const currency = bookingData.finalInvoiceCurrency?.toLowerCase() || 'usd'; // Default to USD if not set
    const customerEmail = bookingData.invoiceRecipientEmail || bookingData.email;
    const bookingName = bookingData.name || bookingData.entryName || "Chez Shiobara Booking";

    if (!amount || amount <= 0) {
      return { error: "Invalid invoice amount for payment. Please ensure the invoice has been finalized." };
    }
    if (!customerEmail) {
        return { error: "Customer email not found for this booking. Please update the booking details." };
    }

    const lineItems = [
      {
        price_data: {
          currency: currency,
          product_data: {
            name: `Stay at Chez Shiobara for ${bookingName}`,
            description: `Payment for booking ID: ${bookingId}. Dates: ${bookingData.checkInDate.toDate().toLocaleDateString()} - ${bookingData.checkOutDate.toDate().toLocaleDateString()}`,
            // Consider adding a generic image for your B&B if desired:
            // images: ['https://yourdomain.com/images/bnb_logo_for_stripe.png'], 
          },
          unit_amount: Math.round(amount * 100), // Amount in cents
        },
        quantity: 1,
      },
    ];

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) {
      console.error("NEXT_PUBLIC_BASE_URL is not set. Stripe success/cancel URLs will be broken.");
      return { error: "Application base URL is not configured. Cannot create payment session." };
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${bookingId}`,
      cancel_url: `${baseUrl}/payment/cancel?booking_id=${bookingId}`,
      customer_email: customerEmail,
      metadata: {
        bookingId: bookingId,
      },
      // Optional: Automatically update booking status to 'paid' on successful payment
      // payment_intent_data: {
      //   metadata: {
      //     bookingId: bookingId, // Redundant with session metadata but can be useful for webhooks
      //   },
      // },
    });

    if (!session.id) {
        return { error: "Could not create payment session." };
    }

    // Optionally: Store the Stripe session ID on the booking for reconciliation
    // await updateDoc(bookingDocRef, {
    //   stripeSessionId: session.id,
    //   stripeSessionCreatedAt: serverTimestamp(),
    // });

    return { sessionId: session.id };

  } catch (error) {
    console.error("Error creating Stripe Checkout session:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during payment processing.";
    return { error: `Failed to create payment session: ${errorMessage}` };
  }
}
