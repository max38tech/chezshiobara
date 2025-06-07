
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
  console.log("[Stripe Action] createCheckoutSession called for bookingId:", bookingId);
  console.log("[Stripe Action] Current NODE_ENV:", process.env.NODE_ENV);
  
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("[Stripe Action] Stripe secret key is not configured.");
    return { error: "Payment processing is not configured correctly. STRIPE_SECRET_KEY missing." };
  }
  if (!bookingId) {
    console.error("[Stripe Action] Booking ID is required.");
    return { error: "Booking ID is required." };
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-06-20', 
  });

  try {
    const bookingDocRef = doc(db, "bookingRequests", bookingId);
    const bookingSnap = await getDoc(bookingDocRef);

    if (!bookingSnap.exists()) {
      console.error(`[Stripe Action] Booking not found for ID: ${bookingId}`);
      return { error: "Booking not found." };
    }

    const bookingData = bookingSnap.data() as BookingRequest;

    const allowedStatusesForPayment: BookingRequest['status'][] = ['confirmed', 'manual_confirmed'];
    if (!allowedStatusesForPayment.includes(bookingData.status)) {
        console.warn(`[Stripe Action] Booking ${bookingId} status (${bookingData.status}) does not allow payment.`);
        return { error: `Booking must be in a 'confirmed' or 'manual_confirmed' state to proceed with payment. Current status: ${bookingData.status}.` };
    }

    const amount = bookingData.finalInvoiceAmount;
    const currency = bookingData.finalInvoiceCurrency?.toLowerCase() || 'usd';
    const customerEmail = bookingData.invoiceRecipientEmail || bookingData.email;
    const bookingName = bookingData.name || bookingData.entryName || "Chez Shiobara Booking";

    if (!amount || amount <= 0) {
      console.error(`[Stripe Action] Invalid invoice amount for booking ${bookingId}: ${amount}`);
      return { error: "Invalid invoice amount for payment. Please ensure the invoice has been finalized." };
    }
    if (!customerEmail) {
        console.error(`[Stripe Action] Customer email not found for booking ${bookingId}.`);
        return { error: "Customer email not found for this booking. Please update the booking details." };
    }

    const lineItems = [
      {
        price_data: {
          currency: currency,
          product_data: {
            name: `Stay at Chez Shiobara for ${bookingName}`,
            description: `Payment for booking ID: ${bookingId}. Dates: ${bookingData.checkInDate.toDate().toLocaleDateString()} - ${bookingData.checkOutDate.toDate().toLocaleDateString()}`,
          },
          unit_amount: Math.round(amount * 100), // Amount in cents
        },
        quantity: 1,
      },
    ];

    // Determine baseUrl based on NODE_ENV directly in the action
    // This ensures it uses the correct URL at runtime of the server action.
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://chezshiobara.com' 
      : (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'); // Fallback to NEXT_PUBLIC_BASE_URL for local, then hardcoded local

    console.log("[Stripe Action] Using baseUrl for redirect:", baseUrl);

    if (!baseUrl || (!baseUrl.startsWith('http://localhost') && !baseUrl.startsWith('https://'))) {
      console.error("[Stripe Action] Application base URL is not configured or invalid. NEXT_PUBLIC_BASE_URL was:", process.env.NEXT_PUBLIC_BASE_URL);
      return { error: "Application base URL is not configured correctly for payment redirects." };
    }
    
    const session = await stripe.checkout.sessions.create({
      // payment_method_types: ['card'], // REMOVED to allow Stripe to dynamically show all enabled payment methods
      line_items: lineItems,
      mode: 'payment',
      success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${bookingId}`,
      cancel_url: `${baseUrl}/payment/cancel?booking_id=${bookingId}`,
      customer_email: customerEmail,
      metadata: {
        bookingId: bookingId,
      },
      // Automatically expand the payment_intent so we can check its status on the success page
      // This is useful for confirming payment more robustly.
      expand: ['payment_intent'], 
    });

    if (!session.id) {
        console.error("[Stripe Action] Stripe session.id was null after creation.");
        return { error: "Could not create payment session." };
    }
    
    console.log(`[Stripe Action] Stripe session created successfully for booking ${bookingId}: ${session.id}`);
    return { sessionId: session.id };

  } catch (error) {
    console.error("[Stripe Action] Error creating Stripe Checkout session:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during payment processing.";
    return { error: `Failed to create payment session: ${errorMessage}` };
  }
}

// Ensure this file also has 'use server' if it's not implicitly a server action through usage
// It already is, as Next.js server actions are server-side by default.
