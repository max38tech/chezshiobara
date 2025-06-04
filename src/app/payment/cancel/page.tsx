
import { PageContentWrapper } from '@/components/layout/page-content-wrapper';
import { PageTitle } from '@/components/ui/page-title';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { XCircle } from 'lucide-react';

export default function PaymentCancelPage({ searchParams }: { searchParams: { booking_id?: string } }) {
  const bookingId = searchParams?.booking_id;

  return (
    <PageContentWrapper>
      <PageTitle>Payment Cancelled</PageTitle>
      <div className="max-w-lg mx-auto">
        <Card className="shadow-lg bg-red-50 border-red-200">
          <CardHeader className="items-center">
            <XCircle className="h-16 w-16 text-red-600 mb-3" />
            <CardTitle className="font-headline text-3xl text-red-700">Payment Not Completed</CardTitle>
            <CardDescription className="font-body text-red-600">
              Your payment process was cancelled or was not successful.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-center">
            <p className="font-body">
              Your booking (ID: {bookingId || 'N/A'}) has not been paid for. If you'd like to try again, you can go back to the checkout page.
            </p>
            <p className="font-body text-sm text-muted-foreground">
              If you encountered any issues or have questions, please don't hesitate to contact us.
            </p>
          </CardContent>
        </Card>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          {bookingId && (
            <Button asChild variant="outline">
              <Link href={`/checkout/${bookingId}`}>Try Payment Again</Link>
            </Button>
          )}
          <Button asChild>
            <Link href="/">Return to Homepage</Link>
          </Button>
        </div>
      </div>
    </PageContentWrapper>
  );
}
