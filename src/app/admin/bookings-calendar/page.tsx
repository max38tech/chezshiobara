
import { PageContentWrapper } from "@/components/layout/page-content-wrapper";
import { PageTitle } from "@/components/ui/page-title";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { getConfirmedBookings, type ConfirmedBooking } from "@/actions/booking";
import { eachDayOfInterval, startOfDay } from 'date-fns';
import { AlertCircle, CalendarDays } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function getAllBookedDates(bookings: ConfirmedBooking[]): Date[] {
  const allDates: Set<string> = new Set(); // Use Set to store string representations to avoid duplicate Date objects for the same day

  bookings.forEach(booking => {
    // Create an interval from checkInDate (inclusive) to the day *before* checkOutDate (inclusive)
    // This represents the nights stayed.
    const interval = {
      start: startOfDay(booking.checkInDate),
      end: startOfDay(new Date(booking.checkOutDate.getTime() - 24 * 60 * 60 * 1000)) // Day before checkout
    };
    
    // Ensure start is not after end, which can happen if checkOutDate is the day after checkInDate
    if (interval.start <= interval.end) {
        const datesInInterval = eachDayOfInterval(interval);
        datesInInterval.forEach(date => allDates.add(date.toISOString().split('T')[0]));
    } else if (interval.start.toISOString().split('T')[0] === booking.checkInDate.toISOString().split('T')[0]) {
        // Handle single night stays correctly if checkOutDate is the next day
         allDates.add(booking.checkInDate.toISOString().split('T')[0]);
    }
  });

  return Array.from(allDates).map(dateStr => new Date(dateStr));
}


export default async function BookingsCalendarPage() {
  const confirmedBookings = await getConfirmedBookings();
  const bookedDates = getAllBookedDates(confirmedBookings);

  return (
    <PageContentWrapper>
      <PageTitle className="text-3xl sm:text-4xl mb-8 text-left">Bookings Calendar</PageTitle>
      <Card className="mb-8 bg-muted/30 border-border">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-primary" />
            Confirmed Bookings Overview
          </CardTitle>
          <CardDescription className="font-body">
            This calendar highlights dates with confirmed bookings. 
            Currently, it shows which days are booked. Future enhancements could include showing booking details on click.
          </CardDescription>
        </CardHeader>
      </Card>

      {confirmedBookings.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Confirmed Bookings</AlertTitle>
          <AlertDescription>
            There are currently no confirmed bookings to display on the calendar.
          </AlertDescription>
        </Alert>
      )}

      {confirmedBookings.length > 0 && (
        <Card className="shadow-lg">
          <CardContent className="flex justify-center p-2 sm:p-4">
            <Calendar
              mode="multiple"
              selected={bookedDates}
              numberOfMonths={2}
              className="rounded-md border"
              disabled // Make the calendar read-only for display
              defaultMonth={bookedDates.length > 0 ? bookedDates[0] : new Date()} // Start view from first booking or current month
            />
          </CardContent>
        </Card>
      )}
       <Card className="mt-6">
        <CardHeader>
            <CardTitle className="font-headline text-lg">Legend</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-primary"></div>
                <span className="font-body text-sm">Booked Night</span>
            </div>
        </CardContent>
      </Card>
    </PageContentWrapper>
  );
}
