
import { PageContentWrapper } from '@/components/layout/page-content-wrapper';
import { PageTitle } from '@/components/ui/page-title';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Stripe from 'stripe';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

async function getSessionDetails(sessionId: string) {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("Stripe secret key is not configured for success page.");
    return { error: "Configuration error: Stripe secret key missing." };
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent'], // Expand payment_intent to check its status
    });
    return {
      customerEmail: session.customer_details?.email,
      amountTotal: session.amount_total,
      currency: session.currency,
      paymentStatus: session.payment_status, // 'paid', 'unpaid', 'no_payment_required'
      paymentIntentStatus: (session.payment_intent as Stripe.PaymentIntent)?.status, // 'succeeded', 'processing', etc.
      bookingId: session.metadata?.bookingId,
    };
  } catch (error) {
    console.error("Error retrieving session:", error);
    return { error: error instanceof Error ? error.message : "Could not retrieve session details." };
  }
}

// Function to update booking status to 'paid' in Firestore
async function markBookingAsPaid(bookingId: string) {
  if (!bookingId) {
    console.warn("markBookingAsPaid: No bookingId provided.");
    return { success: false, message: "No booking ID to update." };
  }
  try {
    const bookingRef = doc(db, "bookingRequests", bookingId);
    await updateDoc(bookingRef, {
      status: 'paid',
      paidAt: serverTimestamp(), // Record when it was marked as paid
    });
    console.log(`Booking ${bookingId} marked as paid.`);
    return { success: true, message: "Booking status updated to paid." };
  } catch (error) {
    console.error(`Error marking booking ${bookingId} as paid:`, error);
    return { success: false, message: `Failed to update booking status: ${error instanceof Error ? error.message : "Unknown error"}` };
  }
}


export default async function PaymentSuccessPage({ searchParams }: { searchParams: { session_id?: string, booking_id?: string } }) {
  const sessionId = searchParams?.session_id;
  // Use booking_id from query param as fallback if metadata somehow fails, or for direct updates.
  const bookingIdFromQuery = searchParams?.booking_id; 
  let sessionDetails = null;
  let errorMessage = null;
  let bookingMarkedPaidMessage = null;

  if (!sessionId) {
    errorMessage = "No payment session ID found. Your payment might not have been processed correctly.";
  } else {
    const result = await getSessionDetails(sessionId);
    if ('error' in result) {
      errorMessage = result.error;
    } else {
      sessionDetails = result;
      // If payment was successful, attempt to mark the booking as paid
      if (sessionDetails.paymentStatus === 'paid' || sessionDetails.paymentIntentStatus === 'succeeded') {
        const bookingIdToUpdate = sessionDetails.bookingId || bookingIdFromQuery;
        if (bookingIdToUpdate) {
          const updateResult = await markBookingAsPaid(bookingIdToUpdate);
          if (updateResult.success) {
            bookingMarkedPaidMessage = "Your booking has been confirmed as paid.";
          } else {
            // Log this issue, but don't necessarily show a scary error to the user if payment itself was fine
            console.warn(`Payment successful (session: ${sessionId}), but failed to automatically mark booking ${bookingIdToUpdate} as paid: ${updateResult.message}`);
            bookingMarkedPaidMessage = "Payment received. There was an issue auto-updating booking status; please contact us if it's not reflected shortly.";
          }
        } else {
            console.warn(`Payment successful (session: ${sessionId}), but no bookingId found in session metadata or query params to mark as paid.`);
        }
      }
    }
  }

  const isPaymentSuccessful = sessionDetails && (sessionDetails.paymentStatus === 'paid' || sessionDetails.paymentIntentStatus === 'succeeded');

  return (
    <PageContentWrapper>
      <PageTitle>Payment Status</PageTitle>
      <div className="max-w-lg mx-auto">
        {errorMessage ? (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Processing Payment Information</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : isPaymentSuccessful ? (
          <Card className="shadow-lg bg-green-50 border-green-200">
            <CardHeader className="items-center">
              <CheckCircle2 className="h-16 w-16 text-green-600 mb-3" />
              <CardTitle className="font-headline text-3xl text-green-700">Payment Successful!</CardTitle>
              <CardDescription className="font-body text-green-600">
                Thank you for your payment. Your booking details are below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-center">
              {sessionDetails.customerEmail && <p className="font-body">An email confirmation has been sent to: <strong>{sessionDetails.customerEmail}</strong></p>}
              {sessionDetails.amountTotal && sessionDetails.currency && (
                <p className="font-body">Amount Paid: <strong>{(sessionDetails.amountTotal / 100).toFixed(2)} {sessionDetails.currency.toUpperCase()}</strong></p>
              )}
              {(sessionDetails.bookingId || bookingIdFromQuery) && (
                <p className="font-body">Booking ID: <strong>{sessionDetails.bookingId || bookingIdFromQuery}</strong></p>
              )}
              {bookingMarkedPaidMessage && <p className="font-body text-sm mt-2">{bookingMarkedPaidMessage}</p>}
              <p className="font-body text-sm text-muted-foreground mt-4">We look forward to welcoming you to Chez Shiobara!</p>
            </CardContent>
          </Card>
        ) : sessionDetails ? (
           <Alert className="mb-6 border-orange-300 bg-orange-50 text-orange-700">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertTitle>Payment Status: {sessionDetails.paymentStatus || sessionDetails.paymentIntentStatus || 'Unknown'}</AlertTitle>
            <AlertDescription>Your payment status is currently {sessionDetails.paymentStatus || sessionDetails.paymentIntentStatus}. If this is unexpected, or if it doesn't update shortly, please contact us.</AlertDescription>
          </Alert>
        ) : (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Processing Payment Information</AlertTitle>
            <AlertDescription>Please wait while we confirm your payment status. Do not close this page.</AlertDescription>
          </Alert>
        )}
        <div className="mt-8 flex justify-center">
          <Button asChild>
            <Link href="/">Return to Homepage</Link>
          </Button>
        </div>
      </div>
    </PageContentWrapper>
  );
}
