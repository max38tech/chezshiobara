
"use client";

import { useEffect, useState, useMemo } from 'react';
import type { DayContentProps } from 'react-day-picker'; // Import correct type
import { PageContentWrapper } from "@/components/layout/page-content-wrapper";
import { PageTitle } from "@/components/ui/page-title";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { getAllCalendarEvents, type CalendarEvent } from "@/actions/booking";
import { eachDayOfInterval, startOfDay, isSameDay, subDays } from 'date-fns';
import { AlertCircle, CalendarDays, Info, PlusCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ManualCalendarEntryForm } from './manual-calendar-entry-form';
import { cn } from "@/lib/utils";

interface DayWithEventInfo {
  date: Date;
  eventType?: CalendarEvent['status'];
  eventName?: string;
}

// Helper to get all unique dates covered by events with their info
function getEventDatesWithInfo(events: CalendarEvent[]): DayWithEventInfo[] {
  const dateMap = new Map<string, DayWithEventInfo>();

  events.forEach(event => {
    // Interval includes checkInDate and all days up to (but not including) checkOutDate
    const intervalEnd = subDays(startOfDay(event.checkOutDate), 0); // Actually end of day before checkout.
                                                                     // If checkout is 15th, they occupy 14th.
                                                                     // Interval should be [checkIn, checkOut-1day]
    
    let eventIntervalEnd = startOfDay(event.checkOutDate);
    if (isSameDay(startOfDay(event.checkInDate), eventIntervalEnd)) { // Single day event (e.g. check in/out same day, effectively 0 nights but occupies 1 day slot)
         eventIntervalEnd = startOfDay(event.checkInDate); // Interval will be just this one day
    } else {
        eventIntervalEnd = subDays(startOfDay(event.checkOutDate), 1); // Occupies up to day before checkout
    }


    if (startOfDay(event.checkInDate) <= eventIntervalEnd) {
        const datesInInterval = eachDayOfInterval({
          start: startOfDay(event.checkInDate),
          end: eventIntervalEnd,
        });

        datesInInterval.forEach(date => {
          const dateString = date.toISOString().split('T')[0];
          const existingEntry = dateMap.get(dateString);
          if (!existingEntry || (existingEntry.eventType === 'blocked' && event.status !== 'blocked')) {
            // Prioritize non-blocked events if there's an overlap, or take the first one
            dateMap.set(dateString, {
              date: date,
              eventType: event.status,
              eventName: event.name,
            });
          }
        });
    }
  });
  return Array.from(dateMap.values());
}


export default function BookingsCalendarPage() {
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isClient, setIsClient] = useState(false);

  const fetchCalendarEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const events = await getAllCalendarEvents();
      setCalendarEvents(events);
    } catch (err) {
      console.error("Error fetching calendar events:", err);
      setError("Failed to load calendar events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarEvents();
    setIsClient(true);
  }, []);

  const eventDatesWithInfo = useMemo(() => getEventDatesWithInfo(calendarEvents), [calendarEvents]);

  const modifiers = useMemo(() => ({
    confirmed: eventDatesWithInfo.filter(d => d.eventType === 'confirmed' || d.eventType === 'paid').map(d => d.date),
    blocked: eventDatesWithInfo.filter(d => d.eventType === 'blocked').map(d => d.date),
    manual: eventDatesWithInfo.filter(d => d.eventType === 'manual_booking' || d.eventType === 'manual_confirmed').map(d => d.date),
  }), [eventDatesWithInfo]);

  const modifierClassNames = {
    confirmed: "bg-primary text-primary-foreground hover:bg-primary/90 aria-selected:!bg-primary aria-selected:!text-primary-foreground",
    blocked: "bg-destructive text-destructive-foreground hover:bg-destructive/90 opacity-70 aria-selected:!bg-destructive aria-selected:!text-destructive-foreground",
    manual: "bg-accent text-accent-foreground hover:bg-accent/90 aria-selected:!bg-accent aria-selected:!text-accent-foreground",
    // selected class from react-day-picker will apply ring if `selected={selectedDate}` is used
  };
  
  const CustomDayContent = (props: DayContentProps) => {
    const { date } = props;
    const eventInfoForDay = eventDatesWithInfo.find(edi => isSameDay(edi.date, date));
    const tooltipText = eventInfoForDay ? `${eventInfoForDay.eventName} (${eventInfoForDay.eventType})` : "";

    return (
      <div title={tooltipText} className="relative w-full h-full flex items-center justify-center">
        {date.getDate()}
      </div>
    );
  };


  if (loading && !isClient) {
    return (
      <PageContentWrapper className="flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </PageContentWrapper>
    );
  }

  if (error) {
    return (
      <PageContentWrapper>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </PageContentWrapper>
    );
  }
  
  const eventsOnSelectedDate = selectedDate 
    ? calendarEvents.filter(event => {
        const selDateStart = startOfDay(selectedDate);
        // Event occupies days from checkInDate up to, but not including, checkOutDate
        return selDateStart >= startOfDay(event.checkInDate) && selDateStart < startOfDay(event.checkOutDate);
      })
    : [];


  return (
    <PageContentWrapper>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <PageTitle className="text-3xl sm:text-4xl mb-0 text-left">Bookings Calendar</PageTitle>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Manual Entry
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Manual Calendar Entry</DialogTitle>
              <DialogDescription>
                Block out dates for personal use or add a direct booking.
              </DialogDescription>
            </DialogHeader>
            <ManualCalendarEntryForm 
              onSuccess={() => {
                fetchCalendarEvents();
                setIsFormOpen(false);
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <Card className="mb-8 bg-muted/30 border-border">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-primary" />
            Calendar Overview
          </CardTitle>
          <CardDescription className="font-body">
            Highlights dates with confirmed bookings, manual bookings, and blocked periods. Click a date to see details.
          </CardDescription>
        </CardHeader>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-lg lg:col-span-2">
          <CardContent className="flex justify-center p-2 sm:p-4">
            {isClient ? (
                <Calendar
                    mode="single" // Changed from "multiple"
                    selected={selectedDate} // Use selectedDate for single selection highlighting
                    onSelect={setSelectedDate} // Update selectedDate on click
                    modifiers={modifiers}
                    modifierClassNames={modifierClassNames}
                    components={{ DayContent: CustomDayContent }}
                    numberOfMonths={typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 2}
                    className="rounded-md border w-full"
                    disabled={(date) => date < startOfDay(new Date())} 
                    defaultMonth={selectedDate || new Date()}
                    onDayClick={(day, activeModifiers) => { // onDayClick is still useful
                        if (!activeModifiers.disabled) {
                            setSelectedDate(day);
                        }
                    }}
                />
            ) : (
                 <div className="h-[360px] w-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                 </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-wrap gap-4 pt-4 justify-center sm:justify-start">
            <div className="flex items-center gap-2"><div className="h-4 w-4 rounded" style={{backgroundColor: modifierClassNames.confirmed.split(' ')[0].replace('bg-','')}}></div><span className="font-body text-xs">Guest Booking</span></div>
            <div className="flex items-center gap-2"><div className="h-4 w-4 rounded" style={{backgroundColor: modifierClassNames.manual.split(' ')[0].replace('bg-','')}}></div><span className="font-body text-xs">Manual Booking</span></div>
            <div className="flex items-center gap-2"><div className="h-4 w-4 rounded opacity-70" style={{backgroundColor: modifierClassNames.blocked.split(' ')[0].replace('bg-','')}}></div><span className="font-body text-xs">Blocked</span></div>
            <div className="flex items-center gap-2"><div className="h-4 w-4 rounded ring-2 ring-ring ring-offset-background"></div><span className="font-body text-xs">Selected Day</span></div>

          </CardFooter>
        </Card>

        <Card className="shadow-lg lg:col-span-1">
            <CardHeader>
                <CardTitle className="font-headline">
                    Details for: {selectedDate ? selectedDate.toLocaleDateString() : 'No date selected'}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {loading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
                {!loading && eventsOnSelectedDate.length === 0 && (
                    <p className="font-body text-muted-foreground">No events for this date.</p>
                )}
                {!loading && eventsOnSelectedDate.length > 0 && (
                    <ul className="space-y-3">
                        {eventsOnSelectedDate.map(event => (
                            <li key={event.id} className="font-body text-sm border-b pb-2 last:border-b-0">
                                <p className="font-semibold">{event.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    Type: <span className={cn(
                                        (event.status === 'confirmed' || event.status === 'paid') ? 'text-primary' :
                                        (event.status === 'manual_booking' || event.status === 'manual_confirmed') ? 'text-accent-foreground' : // Using accent-foreground for visibility
                                        event.status === 'blocked' ? 'text-destructive' : ''
                                    )}>{event.status.replace(/_/g, ' ').toUpperCase()}</span>
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
      </div>
    </PageContentWrapper>
  );
}

    