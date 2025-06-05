
"use client";

import { useEffect, useState, useMemo } from 'react';
import type { DayContentProps } from 'react-day-picker';
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
    let eventIntervalEnd = startOfDay(event.checkOutDate);
    if (isSameDay(startOfDay(event.checkInDate), eventIntervalEnd)) {
         eventIntervalEnd = startOfDay(event.checkInDate); 
    } else {
        eventIntervalEnd = subDays(startOfDay(event.checkOutDate), 1); 
    }

    if (startOfDay(event.checkInDate) <= eventIntervalEnd) {
        const datesInInterval = eachDayOfInterval({
          start: startOfDay(event.checkInDate),
          end: eventIntervalEnd,
        });

        datesInInterval.forEach(date => {
          const dateString = date.toISOString().split('T')[0];
          const existingEntry = dateMap.get(dateString);
          // Prioritize non-blocked events or more specific statuses if overlap
          const priorityOrder: CalendarEvent['status'][] = ['paid', 'confirmed', 'manual_booking', 'manual_confirmed', 'blocked'];
          const currentPriority = existingEntry ? priorityOrder.indexOf(existingEntry.eventType!) : -1;
          const newPriority = priorityOrder.indexOf(event.status);

          if (!existingEntry || newPriority < currentPriority) { // Lower index means higher priority
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
    confirmed: "bg-green-300 text-green-800 hover:bg-green-400 aria-selected:!bg-green-400 aria-selected:!text-green-900", // Sage green for confirmed/paid
    blocked: "bg-destructive text-destructive-foreground hover:bg-destructive/90 opacity-70 aria-selected:!bg-destructive aria-selected:!text-destructive-foreground",
    manual: "bg-accent text-accent-foreground hover:bg-accent/90 aria-selected:!bg-accent aria-selected:!text-accent-foreground",
  };
  
  const CustomDayContent = (props: DayContentProps) => {
    const { date } = props;
    const eventInfoForDay = eventDatesWithInfo.find(edi => isSameDay(edi.date, date));
    const tooltipText = eventInfoForDay ? `${eventInfoForDay.eventName} (${eventInfoForDay.eventType?.replace('_', ' ')})` : "";

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
        const checkInStart = startOfDay(event.checkInDate);
        const checkOutStart = startOfDay(event.checkOutDate);
        // Event occupies days from checkInDate up to, but not including, checkOutDate
        return selDateStart >= checkInStart && selDateStart < checkOutStart;
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
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    modifiers={modifiers}
                    modifierClassNames={modifierClassNames}
                    components={{ DayContent: CustomDayContent }}
                    numberOfMonths={typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 2}
                    className="rounded-md border w-full"
                    disabled={(date) => date < startOfDay(new Date())} 
                    defaultMonth={selectedDate || new Date()}
                    onDayClick={(day, activeModifiers) => { 
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
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-green-300"></div>
              <span className="font-body text-xs">Confirmed/Paid Booking</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-accent"></div>
              <span className="font-body text-xs">Manual Booking</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-destructive opacity-70"></div>
              <span className="font-body text-xs">Blocked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded ring-2 ring-ring ring-offset-background"></div>
              <span className="font-body text-xs">Selected Day</span>
            </div>
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
                                        (event.status === 'confirmed' || event.status === 'paid') ? 'text-green-700 font-medium' :
                                        (event.status === 'manual_booking' || event.status === 'manual_confirmed') ? 'text-accent-foreground font-medium' : 
                                        event.status === 'blocked' ? 'text-destructive font-medium' : ''
                                    )}>{event.status.replace(/_/g, ' ').toUpperCase()}</span>
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Check-in: {event.checkInDate.toLocaleDateString()}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Check-out: {event.checkOutDate.toLocaleDateString()}
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

    