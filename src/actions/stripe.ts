
"use server";

import Stripe from 'stripe';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { BookingRequest } from '@/components/specific/admin/booking-requests-table'; // Assuming this type is sufficiently detailed

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
    apiVersion: '2024-06-20', // Use the latest API version
  });

  try {
    const bookingDocRef = doc(db, "bookingRequests", bookingId);
    const bookingSnap = await getDoc(bookingDocRef);

    if (!bookingSnap.exists()) {
      return { error: "Booking not found." };
    }

    const bookingData = bookingSnap.data() as BookingRequest;

    if (bookingData.status !== 'confirmed' && bookingData.status !== 'pending') { // Allow payment for pending if admin initiates
        // Or just 'confirmed'. For now, let's assume admin might want to take payment for a pending one they are about to confirm.
        // return { error: "Booking must be confirmed to proceed with payment." };
    }

    const amount = bookingData.finalInvoiceAmount;
    const currency = bookingData.finalInvoiceCurrency?.toLowerCase() || 'usd'; // Default to USD if not set
    const customerEmail = bookingData.invoiceRecipientEmail || bookingData.email;
    const bookingName = bookingData.name;

    if (!amount || amount <= 0) {
      return { error: "Invalid invoice amount for payment." };
    }
    if (!customerEmail) {
        return { error: "Customer email not found for this booking." };
    }


    const lineItems = [
      {
        price_data: {
          currency: currency,
          product_data: {
            name: `Booking at Chez Shiobara for ${bookingName}`,
            description: `Payment for booking ID: ${bookingId}`,
            images: [], // Optional: Add B&B image URL here
          },
          unit_amount: Math.round(amount * 100), // Amount in smallest currency unit (e.g., cents)
        },
        quantity: 1,
      },
    ];

    // Ensure URLs are absolute for Stripe
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'; // Fallback for local dev

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
    });

    if (!session.id) {
        return { error: "Could not create payment session." };
    }

    return { sessionId: session.id };

  } catch (error)
 {
    console.error("Error creating Stripe Checkout session:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during payment processing.";
    return { error: `Failed to create payment session: ${errorMessage}` };
  }
}
