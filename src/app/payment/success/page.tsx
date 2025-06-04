
import { PageContentWrapper } from '@/components/layout/page-content-wrapper';
import { PageTitle } from '@/components/ui/page-title';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Stripe from 'stripe';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

async function getSessionDetails(sessionId: string) {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("Stripe secret key is not configured for success page.");
    return { error: "Configuration error." };
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return {
      customerEmail: session.customer_details?.email,
      amountTotal: session.amount_total,
      currency: session.currency,
      paymentStatus: session.payment_status,
      bookingId: session.metadata?.bookingId,
    };
  } catch (error) {
    console.error("Error retrieving session:", error);
    return { error: error instanceof Error ? error.message : "Could not retrieve session details." };
  }
}


export default async function PaymentSuccessPage({ searchParams }: { searchParams: { session_id?: string, booking_id?: string } }) {
  const sessionId = searchParams?.session_id;
  const bookingIdFromQuery = searchParams?.booking_id; // Use this if metadata somehow fails
  let sessionDetails = null;
  let errorMessage = null;

  if (!sessionId) {
    errorMessage = "No payment session ID found. Your payment might not have been processed correctly.";
  } else {
    const result = await getSessionDetails(sessionId);
    if ('error' in result) {
      errorMessage = result.error;
    } else {
      sessionDetails = result;
      // Optional: Here you could trigger an update to Firestore for the booking using sessionDetails.bookingId or bookingIdFromQuery
      // For now, we are just displaying information.
    }
  }

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
        ) : sessionDetails && sessionDetails.paymentStatus === 'paid' ? (
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
              <p className="font-body text-sm text-muted-foreground">We look forward to welcoming you to Chez Shiobara!</p>
            </CardContent>
          </Card>
        ) : sessionDetails ? (
           <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Payment Status: {sessionDetails.paymentStatus || 'Unknown'}</AlertTitle>
            <AlertDescription>Your payment status is currently {sessionDetails.paymentStatus}. If this is unexpected, please contact us.</AlertDescription>
          </Alert>
        ) : (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Processing Payment Information</AlertTitle>
            <AlertDescription>Please wait while we confirm your payment status.</AlertDescription>
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
