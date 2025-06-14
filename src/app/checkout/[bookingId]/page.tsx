
import { doc, getDoc, type Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PageContentWrapper } from '@/components/layout/page-content-wrapper';
import { PageTitle } from '@/components/ui/page-title';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StripeCheckoutButton } from './stripe-checkout-button'; // Client component
import { AlertCircle, Ticket, Banknote, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { BookingRequest } from '@/components/specific/admin/booking-requests-table';
import { getPaymentSettings, type PaymentSettings } from '@/actions/payment'; // Import payment settings
import { Separator } from '@/components/ui/separator';

interface BookingDataForCheckout {
  id: string;
  name: string;
  email: string; 
  invoiceRecipientEmail?: string; 
  checkInDate: Date;
  checkOutDate: Date;
  guests: number;
  status: BookingRequest['status']; 
  finalInvoiceAmount?: number;
  finalInvoiceCurrency?: string;
  entryName?: string; 
}

async function getBookingDetails(bookingId: string): Promise<BookingDataForCheckout | null> {
  try {
    const bookingDocRef = doc(db, "bookingRequests", bookingId);
    const bookingSnap = await getDoc(bookingDocRef);

    if (!bookingSnap.exists()) {
      return null;
    }
    const data = bookingSnap.data();
    return {
      id: bookingSnap.id,
      name: data.name || data.entryName || "Guest",
      email: data.email,
      invoiceRecipientEmail: data.invoiceRecipientEmail,
      checkInDate: (data.checkInDate as Timestamp).toDate(),
      checkOutDate: (data.checkOutDate as Timestamp).toDate(),
      guests: data.guests,
      status: data.status,
      finalInvoiceAmount: data.finalInvoiceAmount,
      finalInvoiceCurrency: data.finalInvoiceCurrency,
      entryName: data.entryName,
    };
  } catch (error) {
    console.error("Error fetching booking details for checkout:", error);
    return null;
  }
}

export default async function CheckoutPage({ params }: { params: { bookingId: string } }) {
  const { bookingId } = params;
  const booking = await getBookingDetails(bookingId);
  const paymentSettings = await getPaymentSettings(); // Fetch payment settings

  if (!booking) {
    return (
      <PageContentWrapper>
        <PageTitle>Payment Error</PageTitle>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Booking Not Found</AlertTitle>
          <AlertDescription>
            The booking (ID: {bookingId}) you are trying to pay for could not be found. Please check the ID or contact support.
          </AlertDescription>
        </Alert>
        <Button asChild variant="outline" className="mt-4">
            <Link href="/">Back to Homepage</Link>
        </Button>
      </PageContentWrapper>
    );
  }
  
  const allowedStatusesForPayment: BookingRequest['status'][] = ['confirmed', 'manual_confirmed'];
  if (!allowedStatusesForPayment.includes(booking.status)) {
    return (
      <PageContentWrapper>
        <PageTitle>Payment Not Allowed</PageTitle>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Booking Status Prevents Payment</AlertTitle>
          <AlertDescription>
            This booking (ID: {bookingId}) is not in a 'Confirmed' or 'Manual Confirmed' state. Payment can only be made for confirmed bookings. Current status: {booking.status}. Please contact us if you believe this is an error.
          </AlertDescription>
        </Alert>
         <Button asChild variant="outline" className="mt-4">
            <Link href="/">Back to Homepage</Link>
        </Button>
      </PageContentWrapper>
    );
  }

  if (!booking.finalInvoiceAmount || booking.finalInvoiceAmount <= 0) {
     return (
      <PageContentWrapper>
        <PageTitle>Payment Error</PageTitle>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Invoice Not Ready</AlertTitle>
          <AlertDescription>
            The invoice for this booking (ID: {bookingId}) has not been finalized yet, or the amount is invalid. Please wait for the host to confirm the amount due or contact us.
          </AlertDescription>
        </Alert>
        <Button asChild variant="outline" className="mt-4">
            <Link href="/">Back to Homepage</Link>
        </Button>
      </PageContentWrapper>
    );
  }

  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  // Stripe specific error if card payments are enabled but key is missing
  if (paymentSettings.isCardPaymentEnabled && !publishableKey) {
    console.warn("Stripe Publishable Key is missing. Ensure NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is set in .env and available to the client.");
    // Display error only if card payment is the *only* option or primary option
    if (!paymentSettings.isPaypalEnabled && !paymentSettings.isWiseEnabled) {
      return (
         <PageContentWrapper>
          <PageTitle>Configuration Error</PageTitle>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Online Card Payment Not Configured</AlertTitle>
            <AlertDescription>
              Online card payments are currently unavailable due to a configuration issue. Please contact us to arrange payment. (Admin: STRIPE_PUBLISHABLE_KEY missing).
            </AlertDescription>
          </Alert>
           <Button asChild variant="outline" className="mt-4">
              <Link href="/">Back to Homepage</Link>
          </Button>
        </PageContentWrapper>
      );
    }
  }

  const showAnyPaymentMethod = paymentSettings.isCardPaymentEnabled || paymentSettings.isPaypalEnabled || paymentSettings.isWiseEnabled;


  return (
    <PageContentWrapper>
      <PageTitle>Complete Your Payment</PageTitle>
      <div className="max-w-lg mx-auto space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center gap-2">
              <Ticket className="h-6 w-6 text-primary" />
              Booking for {booking.name}
            </CardTitle>
            <CardDescription className="font-body">
              Please review your booking details and choose your preferred payment method.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 font-body">
            <p><strong>Guest:</strong> {booking.name}</p>
            <p><strong>Email for Confirmation:</strong> {booking.invoiceRecipientEmail || booking.email}</p>
            <p><strong>Check-in:</strong> {booking.checkInDate.toLocaleDateString()}</p>
            <p><strong>Check-out:</strong> {booking.checkOutDate.toLocaleDateString()}</p>
            <p className="text-lg font-headline mt-2">
              <strong>Amount Due:</strong> {booking.finalInvoiceAmount.toFixed(2)} {booking.finalInvoiceCurrency?.toUpperCase() || 'USD'}
            </p>
          </CardContent>
        </Card>

        {!showAnyPaymentMethod && (
          <Alert variant="default" className="border-primary/50 bg-primary/10">
            <Banknote className="h-5 w-5 text-primary" />
            <AlertTitle className="font-headline text-primary">Payment Information</AlertTitle>
            <AlertDescription className="text-primary/90">
              No online payment methods are currently configured. Please contact us directly to arrange payment for your booking.
            </AlertDescription>
          </Alert>
        )}

        {paymentSettings.isCardPaymentEnabled && publishableKey && (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="font-headline text-xl">Pay with Credit/Debit Card</CardTitle>
            </CardHeader>
            <CardContent>
              {paymentSettings.cardPaymentInstructions && (
                <p className="font-body text-sm text-muted-foreground mb-3 whitespace-pre-wrap">{paymentSettings.cardPaymentInstructions}</p>
              )}
              <StripeCheckoutButton bookingId={booking.id} stripePublishableKey={publishableKey} />
              <p className="text-xs text-muted-foreground text-center mt-3">
                Secure card payments processed by Stripe.
              </p>
            </CardContent>
          </Card>
        )}
        
        {(paymentSettings.isCardPaymentEnabled && paymentSettings.isPaypalEnabled) || (paymentSettings.isCardPaymentEnabled && paymentSettings.isWiseEnabled) ? <Separator className="my-6"/> : null}


        {paymentSettings.isPaypalEnabled && paymentSettings.paypalEmailOrLink && (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="font-headline text-xl">Pay with PayPal</CardTitle>
            </CardHeader>
            <CardContent className="font-body space-y-2">
              <p>You can send your payment to the following PayPal account/link:</p>
              <p className="font-semibold text-accent break-all">{paymentSettings.paypalEmailOrLink}</p>
              <p className="text-sm">Please include your Booking ID <strong>({booking.id})</strong> in the payment notes or reference.</p>
            </CardContent>
          </Card>
        )}

        {paymentSettings.isWiseEnabled && paymentSettings.wiseInstructions && (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="font-headline text-xl">Pay with Wise (formerly TransferWise)</CardTitle>
            </CardHeader>
            <CardContent className="font-body space-y-2">
              <p>For Wise payments, please use the following details:</p>
              <div className="bg-muted/50 p-3 rounded-md text-sm whitespace-pre-wrap border">
                {paymentSettings.wiseInstructions}
              </div>
              <p className="text-sm">Please include your Booking ID <strong>({booking.id})</strong> in the payment reference.</p>
            </CardContent>
          </Card>
        )}
        
        {(paymentSettings.isPaypalEnabled || paymentSettings.isWiseEnabled) && (
             <Alert className="border-accent/50 bg-accent/10">
                <Info className="h-5 w-5 text-accent" />
                <AlertTitle className="font-headline text-accent">Important for PayPal/Wise Payments</AlertTitle>
                <AlertDescription className="text-accent/90">
                    After making a payment via PayPal or Wise, please reply to your booking confirmation email or contact us directly to let us know. This will help us confirm your payment and update your booking status promptly.
                </AlertDescription>
            </Alert>
        )}

      </div>
    </PageContentWrapper>
  );
}
