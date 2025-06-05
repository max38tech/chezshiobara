
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PageContentWrapper } from '@/components/layout/page-content-wrapper';
import { PageTitle } from '@/components/ui/page-title';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StripeCheckoutButton } from './stripe-checkout-button'; // Client component
import { AlertCircle, Ticket } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { BookingRequest } from '@/components/specific/admin/booking-requests-table'; // Re-use if structure is similar

interface BookingDataForCheckout {
  id: string;
  name: string;
  email: string; // Original requestor email
  invoiceRecipientEmail?: string; // Specific email for invoice
  checkInDate: Date;
  checkOutDate: Date;
  guests: number;
  status: BookingRequest['status']; // Use the more comprehensive status type
  finalInvoiceAmount?: number;
  finalInvoiceCurrency?: string;
  entryName?: string; // For manual entries
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
      name: data.name || data.entryName || "Guest", // Fallback for name
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
            This booking (ID: {bookingId}) is not in a 'Confirmed' state. Payment can only be made for confirmed bookings. Please contact us if you believe this is an error. Current status: {booking.status}.
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
  if (!publishableKey) {
    console.warn("Stripe Publishable Key is missing. Ensure NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is set in .env and available to the client.");
    return (
       <PageContentWrapper>
        <PageTitle>Configuration Error</PageTitle>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Payment Gateway Not Configured</AlertTitle>
          <AlertDescription>
            Online payments are currently unavailable due to a configuration issue. Please contact us to arrange payment. (Admin: STRIPE_PUBLISHABLE_KEY missing).
          </AlertDescription>
        </Alert>
         <Button asChild variant="outline" className="mt-4">
            <Link href="/">Back to Homepage</Link>
        </Button>
      </PageContentWrapper>
    );
  }


  return (
    <PageContentWrapper>
      <PageTitle>Complete Your Payment</PageTitle>
      <div className="max-w-md mx-auto">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center gap-2">
              <Ticket className="h-6 w-6 text-primary" />
              Booking for {booking.name}
            </CardTitle>
            <CardDescription className="font-body">
              Please review your booking details and proceed to payment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="font-body">
              <p><strong>Guest:</strong> {booking.name}</p>
              <p><strong>Email for Confirmation:</strong> {booking.invoiceRecipientEmail || booking.email}</p>
              <p><strong>Check-in:</strong> {booking.checkInDate.toLocaleDateString()}</p>
              <p><strong>Check-out:</strong> {booking.checkOutDate.toLocaleDateString()}</p>
              <p className="text-lg font-headline mt-2">
                <strong>Amount Due:</strong> {booking.finalInvoiceAmount.toFixed(2)} {booking.finalInvoiceCurrency?.toUpperCase() || 'USD'}
              </p>
            </div>
            <StripeCheckoutButton bookingId={booking.id} stripePublishableKey={publishableKey} />
          </CardContent>
        </Card>
        <p className="text-xs text-muted-foreground text-center mt-4">
          Secure payments processed by Stripe.
        </p>
      </div>
    </PageContentWrapper>
  );
}
