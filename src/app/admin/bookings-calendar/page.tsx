
"use client";

import { useEffect, useState, useMemo } from 'react';
import type { DayContentProps } from 'react-day-picker';
import { PageContentWrapper } from "@/components/layout/page-content-wrapper";
import { PageTitle } from "@/components/ui/page-title";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { getAllCalendarEvents, type CalendarEvent } from "@/actions/booking";
import { eachDayOfInterval, startOfDay, isSameDay, subDays, format as formatDateFn } from 'date-fns';
import { AlertCircle, CalendarDays, Info, PlusCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ManualCalendarEntryForm } from './manual-calendar-entry-form';
import { cn } from "@/lib/utils";
import { buttonVariants } from '@/components/ui/button';

interface DayWithEventInfo {
  date: Date;
  eventType?: CalendarEvent['status'];
  eventName?: string;
}

function getEventDatesWithInfo(events: CalendarEvent[]): DayWithEventInfo[] {
  const dateMap = new Map<string, DayWithEventInfo>();

  events.forEach(event => {
    let eventIntervalEnd = subDays(startOfDay(event.checkOutDate), 1);

    if (startOfDay(event.checkInDate) <= eventIntervalEnd) {
        const datesInInterval = eachDayOfInterval({
          start: startOfDay(event.checkInDate),
          end: eventIntervalEnd,
        });

        datesInInterval.forEach(date => {
          const dateString = date.toISOString().split('T')[0];
          const existingEntry = dateMap.get(dateString);
          const priorityOrder: CalendarEvent['status'][] = ['paid', 'confirmed', 'manual_confirmed', 'manual_booking', 'blocked'];
          const currentPriority = existingEntry ? priorityOrder.indexOf(existingEntry.eventType!) : Infinity;
          const newPriority = priorityOrder.indexOf(event.status);

          if (!existingEntry || newPriority < currentPriority) {
            dateMap.set(dateString, {
              date: date,
              eventType: event.status,
              eventName: event.name,
            });
          }
        });
    } else if (isSameDay(startOfDay(event.checkInDate), eventIntervalEnd)) { // Handles single-day events
        const dateString = startOfDay(event.checkInDate).toISOString().split('T')[0];
         dateMap.set(dateString, {
            date: startOfDay(event.checkInDate),
            eventType: event.status,
            eventName: event.name,
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

  const calendarSpecificClassNames = {
    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
    month: "space-y-4",
    caption: "flex justify-center pt-1 relative items-center",
    caption_label: "text-sm font-headline", // Use headline font
    nav: "space-x-1 flex items-center",
    nav_button: cn(
      buttonVariants({ variant: "outline" }),
      "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
    ),
    nav_button_previous: "absolute left-1",
    nav_button_next: "absolute right-1",
    table: "w-full border-collapse space-y-1",
    head_row: "flex",
    head_cell: "text-muted-foreground rounded-md w-9 font-body text-[0.8rem]", // Use body font
    row: "flex w-full mt-2",
    cell: "h-9 w-9 text-center text-sm p-0 relative first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20", // Removed [&:has([aria-selected])]:bg-accent
    day: cn(
      buttonVariants({ variant: "ghost" }),
      "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
    ),
    day_selected: "bg-transparent text-ring ring-2 ring-ring hover:!bg-transparent focus:!bg-transparent focus:text-ring focus:ring-2 focus:ring-ring", // Important: transparent bg, ring for selection
    day_today: "bg-transparent text-foreground ring-1 ring-border aria-selected:!bg-transparent aria-selected:ring-2 aria-selected:ring-ring", // Today also transparent when selected, relies on event color or base selection ring
    day_outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/30 aria-selected:text-muted-foreground aria-selected:!bg-transparent", // Outside days transparent when selected
    day_disabled: "text-muted-foreground opacity-50",
    day_range_middle: "aria-selected:!bg-transparent", // Ensure range middle is transparent if selected
    day_hidden: "invisible",
  };

  const modifierClassNames = {
    confirmed: "!bg-green-300 text-green-900 hover:!bg-green-400/90 aria-selected:!bg-green-400 aria-selected:!text-green-900 aria-selected:ring-2 aria-selected:ring-green-500",
    blocked: "!bg-destructive/70 text-destructive-foreground hover:!bg-destructive/60 aria-selected:!bg-destructive aria-selected:!text-destructive-foreground aria-selected:ring-2 aria-selected:ring-destructive/80",
    manual: "!bg-accent text-accent-foreground hover:!bg-accent/90 aria-selected:!bg-accent/80 aria-selected:!text-accent-foreground aria-selected:ring-2 aria-selected:ring-accent",
  };

  const CustomDayContent = (props: DayContentProps) => {
    const { date } = props;
    const eventInfoForDay = eventDatesWithInfo.find(edi => isSameDay(edi.date, date));
    let tooltipText = "";
    if (eventInfoForDay) {
        const statusText = eventInfoForDay.eventType?.replace(/_/g, ' ') || 'Event';
        tooltipText = `${eventInfoForDay.eventName} (${statusText.charAt(0).toUpperCase() + statusText.slice(1)})`;
    }

    return (
      <div title={tooltipText} className="relative w-full h-full flex items-center justify-center">
        {formatDateFn(date, "d")}
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
        const eventActualEnd = subDays(startOfDay(event.checkOutDate),1);
        return selDateStart >= checkInStart && selDateStart <= eventActualEnd;
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
                    classNames={calendarSpecificClassNames}
                    modifierClassNames={modifierClassNames}
                    components={{ DayContent: CustomDayContent }}
                    numberOfMonths={typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 2}
                    className="rounded-md border w-full"
                    disabled={(date) => date < startOfDay(new Date())} // Disable past dates, but allow selection
                    defaultMonth={selectedDate || new Date()}
                    onDayClick={(day, activeModifiers) => { // Allow clicking disabled days to clear selection or re-select
                        if (!activeModifiers.disabled || isSameDay(day, startOfDay(new Date()))) { // Allow selecting today even if it's the fromDate
                             setSelectedDate(day);
                        } else if (activeModifiers.disabled) {
                            // If a disabled day is clicked, maybe do nothing or clear selection
                            // setSelectedDate(undefined); // Or keep current selection
                        }
                    }}
                />
            ) : (
                 <div className="h-[360px] w-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                 </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-wrap gap-x-4 gap-y-2 pt-4 justify-center sm:justify-start">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded !bg-green-300"></div>
              <span className="font-body text-xs">Confirmed/Paid</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded !bg-accent"></div>
              <span className="font-body text-xs">Manual Booking</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded !bg-destructive/70"></div>
              <span className="font-body text-xs">Blocked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded ring-2 ring-ring bg-transparent"></div>
              <span className="font-body text-xs">Selected Day</span>
            </div>
          </CardFooter>
        </Card>

        <Card className="shadow-lg lg:col-span-1">
            <CardHeader>
                <CardTitle className="font-headline">
                    Details for: {selectedDate ? formatDateFn(selectedDate, 'PPP') : 'No date selected'}
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
                                    Type: <span className="font-medium text-foreground">
                                      {event.status.replace(/_/g, ' ').toUpperCase()}
                                    </span>
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Check-in: {formatDateFn(event.checkInDate, 'PPP')}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Check-out: {formatDateFn(event.checkOutDate, 'PPP')}
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
    

    