"use client"; // Required because we're using client components like Calendar and BookingForm directly

import { useState, useEffect } from 'react';
import { PageContentWrapper } from '@/components/layout/page-content-wrapper';
import { PageTitle } from '@/components/ui/page-title';
import { SectionTitle } from '@/components/ui/section-title';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingForm } from "@/components/specific/booking/booking-form";

export default function BookingPage() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Ensure Calendar hydration compatibility
  }, []);

  return (
    <PageContentWrapper>
      <PageTitle>Book Your Stay</PageTitle>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Check Availability</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center p-2 sm:p-4">
            {isClient ? (
                 <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border"
                    fromDate={new Date()} // Disable past dates
                 />
            ) : (
              <div className="p-4 w-full h-[300px] flex items-center justify-center text-muted-foreground">Loading calendar...</div>
            )}
          </CardContent>
           <CardContent>
            <p className="font-body text-sm text-muted-foreground text-center mt-2">
              Select a date on the calendar to see if it's available. For actual bookings, please use the form.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <SectionTitle as="h2" className="mb-0">Request a Booking</SectionTitle>
          </CardHeader>
          <CardContent>
            <p className="font-body text-muted-foreground mb-6">
              Fill out the form below to request your booking. We'll get back to you soon to confirm availability and details.
            </p>
            <BookingForm />
          </CardContent>
        </Card>
      </div>
    </PageContentWrapper>
  );
}
