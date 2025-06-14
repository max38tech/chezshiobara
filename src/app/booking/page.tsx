
"use client";

import { useState, useEffect, useMemo } from 'react';
import { PageContentWrapper } from '@/components/layout/page-content-wrapper';
import { PageTitle } from '@/components/ui/page-title';
import { SectionTitle } from '@/components/ui/section-title';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingForm } from "@/components/specific/booking/booking-form";
import { getAllCalendarEvents, type CalendarEvent } from "@/actions/booking";
import { eachDayOfInterval, startOfDay, isSameDay, subDays, format as formatDateFn } from 'date-fns';
import { Loader2 } from 'lucide-react';

// Helper function to get all individual dates covered by events considered "unavailable"
function getUnavailableDates(events: CalendarEvent[]): Date[] {
  const unavailableDateStrings = new Set<string>();
  // Statuses that make a date unavailable for new bookings
  const unavailableStatuses: CalendarEvent['status'][] = ['confirmed', 'paid', 'blocked', 'manual_confirmed'];

  events.forEach(event => {
    if (!unavailableStatuses.includes(event.status)) {
      return;
    }
    // Ensure dates are valid Date objects. Firestore Timestamps are converted to Dates by getAllCalendarEvents.
    if (!(event.checkInDate instanceof Date && !isNaN(event.checkInDate.getTime())) ||
        !(event.checkOutDate instanceof Date && !isNaN(event.checkOutDate.getTime()))) {
      console.warn("Skipping event due to invalid dates for unavailability calculation:", event.id, event.name);
      return;
    }

    const checkInStartOfDay = startOfDay(event.checkInDate);
    // The check-out day is considered available for a new check-in.
    // So, an event from Day A to Day C means Day A and Day B are booked. Day C is free for a new check-in.
    const lastBookedDay = subDays(startOfDay(event.checkOutDate), 1);

    if (checkInStartOfDay <= lastBookedDay) {
      const datesInInterval = eachDayOfInterval({
        start: checkInStartOfDay,
        end: lastBookedDay,
      });
      datesInInterval.forEach(d => unavailableDateStrings.add(d.toISOString().split('T')[0]));
    }
  });
  // Convert ISO strings back to Date objects at the start of the day in local timezone
  return Array.from(unavailableDateStrings).map(dateString => startOfDay(new Date(dateString)));
}


export default function BookingPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isClient, setIsClient] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [availabilityMessage, setAvailabilityMessage] = useState<string>("Select a date to check its availability. Dates that are greyed out and/or struck-through are unavailable.");

  useEffect(() => {
    setIsClient(true);
    const fetchEvents = async () => {
      setLoadingEvents(true);
      try {
        const events = await getAllCalendarEvents();
        setCalendarEvents(events);
      } catch (error) {
        console.error("Failed to fetch calendar events:", error);
        setAvailabilityMessage("Could not load availability. Please try again later.");
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchEvents();
  }, []);

  const unavailableDates = useMemo(() => getUnavailableDates(calendarEvents), [calendarEvents]);
  const today = useMemo(() => startOfDay(new Date()), []);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (!date) {
      setAvailabilityMessage("Select a date to check its availability. Dates that are greyed out and/or struck-through are unavailable.");
      return;
    }
    const isBooked = unavailableDates.some(unavailableDate => isSameDay(date, unavailableDate));
    const isPast = date < today && !isSameDay(date, today);

    if (isBooked) {
      setAvailabilityMessage(`Date ${formatDateFn(date, 'PPP')} is booked.`);
    } else if (isPast) {
      setAvailabilityMessage(`Date ${formatDateFn(date, 'PPP')} is in the past and cannot be selected.`);
    }
    else {
      setAvailabilityMessage(`Date ${formatDateFn(date, 'PPP')} appears available.`);
    }
  };

  const isDisabled = (date: Date): boolean => {
    if (date < today && !isSameDay(date, today)) {
        return true;
    }
    return unavailableDates.some(unavailableDate => isSameDay(date, unavailableDate));
  };

  return (
    <PageContentWrapper>
      <PageTitle>Book Your Stay</PageTitle>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Check Availability</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center p-2 sm:p-4">
            {loadingEvents ? (
              <div className="p-4 w-full h-[330px] flex items-center justify-center text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading calendar availability...
              </div>
            ) : isClient ? (
                 <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    className="rounded-md border"
                    disabled={isDisabled}
                    fromDate={today} 
                    modifiers={{ booked: unavailableDates }}
                    modifiersStyles={{
                        booked: { 
                            color: 'hsl(var(--destructive-foreground))',
                            backgroundColor: 'hsl(var(--destructive) / 0.3)',
                            // textDecoration: 'line-through', // Handled by day_disabled now
                         }
                    }}
                    classNames={{
                        day_disabled: "text-muted-foreground opacity-50 line-through", // More specific disabled styling
                        day_selected: "text-primary-foreground bg-primary focus:bg-primary focus:text-primary-foreground", // Ensure selected available date is clear
                        day_today: "text-foreground ring-1 ring-border",
                    }}
                 />
            ) : (
              <div className="p-4 w-full h-[330px] flex items-center justify-center text-muted-foreground">Initializing calendar...</div>
            )}
             <div className="mt-4 text-center w-full">
                <p className="font-body text-sm text-muted-foreground min-h-[40px] px-2">
                  {availabilityMessage}
                </p>
             </div>
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

