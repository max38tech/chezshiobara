
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

interface BookingData {
  id: string;
  name: string;
  email: string;
  invoiceRecipientEmail?: string;
  checkInDate: Date;
  checkOutDate: Date;
  guests: number;
  status: 'pending' | 'confirmed' | 'declined';
  finalInvoiceAmount?: number;
  finalInvoiceCurrency?: string;
}

async function getBookingDetails(bookingId: string): Promise<BookingData | null> {
  try {
    const bookingDocRef = doc(db, "bookingRequests", bookingId);
    const bookingSnap = await getDoc(bookingDocRef);

    if (!bookingSnap.exists()) {
      return null;
    }
    const data = bookingSnap.data();
    return {
      id: bookingSnap.id,
      name: data.name,
      email: data.email,
      invoiceRecipientEmail: data.invoiceRecipientEmail,
      checkInDate: (data.checkInDate as Timestamp).toDate(),
      checkOutDate: (data.checkOutDate as Timestamp).toDate(),
      guests: data.guests,
      status: data.status,
      finalInvoiceAmount: data.finalInvoiceAmount,
      finalInvoiceCurrency: data.finalInvoiceCurrency,
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
            The booking you are trying to pay for could not be found. Please check the ID or contact support.
          </AlertDescription>
        </Alert>
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
            The invoice for this booking has not been finalized yet. Please wait for the host to confirm the amount due.
          </AlertDescription>
        </Alert>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/admin">Back to Admin</Link>
        </Button>
      </PageContentWrapper>
    );
  }

  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!publishableKey) {
    return (
       <PageContentWrapper>
        <PageTitle>Configuration Error</PageTitle>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Payment Gateway Not Configured</AlertTitle>
          <AlertDescription>
            Stripe payments are not configured correctly (missing publishable key). Please contact the administrator.
          </AlertDescription>
        </Alert>
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
              <p><strong>Email:</strong> {booking.invoiceRecipientEmail || booking.email}</p>
              <p><strong>Check-in:</strong> {booking.checkInDate.toLocaleDateString()}</p>
              <p><strong>Check-out:</strong> {booking.checkOutDate.toLocaleDateString()}</p>
              <p className="text-lg font-headline mt-2">
                <strong>Amount Due:</strong> {booking.finalInvoiceAmount.toFixed(2)} {booking.finalInvoiceCurrency?.toUpperCase()}
              </p>
            </div>
            <StripeCheckoutButton bookingId={booking.id} stripePublishableKey={publishableKey} />
          </CardContent>
        </Card>
      </div>
    </PageContentWrapper>
  );
}
