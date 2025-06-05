
"use client";

import { useEffect, useState, useMemo } from 'react';
import type { DayContentProps } from 'react-day-picker';
import { PageContentWrapper } from "@/components/layout/page-content-wrapper";
import { PageTitle } from "@/components/ui/page-title";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { getAllCalendarEvents, type CalendarEvent } from "@/actions/booking";
import { eachDayOfInterval, startOfDay, isSameDay, subDays, format as formatDateFn } from 'date-fns';
import { AlertCircle, CalendarDays, Info, PlusCircle, Loader2, Edit } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ManualCalendarEntryForm } from './manual-calendar-entry-form';
import { cn } from "@/lib/utils";
import { buttonVariants } from '@/components/ui/button';
import type { ManualCalendarEntryFormValues } from '@/schemas/booking';


interface DayWithEventInfo {
  date: Date;
  eventType?: CalendarEvent['status'];
  eventName?: string;
}

function getEventDatesWithInfo(events: CalendarEvent[]): DayWithEventInfo[] {
  const dateMap = new Map<string, DayWithEventInfo>();

  events.forEach(event => {
    if (!(event.checkInDate instanceof Date && !isNaN(event.checkInDate.getTime())) ||
        !(event.checkOutDate instanceof Date && !isNaN(event.checkOutDate.getTime()))) {
      console.warn("Skipping event due to invalid dates:", event.id, event.name);
      return;
    }

    const checkInStartOfDay = startOfDay(event.checkInDate);
    const eventIntervalEnd = subDays(startOfDay(event.checkOutDate), 1);

    if (checkInStartOfDay <= eventIntervalEnd) {
        const datesInInterval = eachDayOfInterval({
          start: checkInStartOfDay,
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
              date: new Date(date), 
              eventType: event.status,
              eventName: event.name,
            });
          }
        });
    } else {
       console.warn("Event interval issue or 0-duration event for highlighting:", event.id, event.name, { checkIn: event.checkInDate, checkOut: event.checkOutDate });
    }
  });
  return Array.from(dateMap.values());
}


export default function BookingsCalendarPage() {
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState<CalendarEvent | null>(null);
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

  const modifiersStyles = useMemo(() => ({
    confirmed: { backgroundColor: 'hsl(145, 63%, 90%)', color: 'hsl(147, 80%, 15%)' },
    blocked: { backgroundColor: 'hsl(0, 72%, 90%)', color: 'hsl(0, 70%, 35%)' },
    manual: { backgroundColor: 'hsl(262, 75%, 90%)', color: 'hsl(262, 60%, 35%)' },
  }), []);

  const calendarSpecificClassNames = {
    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
    month: "space-y-4",
    caption: "flex justify-center pt-1 relative items-center",
    caption_label: "text-sm font-headline", 
    nav: "space-x-1 flex items-center",
    nav_button: cn(buttonVariants({ variant: "outline" }), "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"),
    nav_button_previous: "absolute left-1",
    nav_button_next: "absolute right-1",
    table: "w-full border-collapse space-y-1",
    head_row: "flex",
    head_cell: "text-muted-foreground rounded-md w-9 font-body text-[0.8rem]", 
    row: "flex w-full mt-2",
    cell: "h-9 w-9 text-center text-sm p-0 relative first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
    day: cn(buttonVariants({ variant: "ghost" }), "h-9 w-9 p-0 font-normal aria-selected:opacity-100"),
    day_selected: "text-ring ring-2 ring-ring focus:text-ring focus:ring-2 focus:ring-ring",
    day_today: "text-foreground ring-1 ring-border aria-selected:text-ring aria-selected:ring-2 aria-selected:ring-ring",
    day_outside: "day-outside text-muted-foreground opacity-50 aria-selected:text-muted-foreground aria-selected:ring-0",
    day_disabled: "text-muted-foreground opacity-50",
    day_range_middle: "aria-selected:rounded-none", 
    day_hidden: "invisible",
  };

  const CustomDayContent = (props: DayContentProps) => {
    const { date } = props;
    const eventInfoForDay = eventDatesWithInfo.find(edi => isSameDay(startOfDay(edi.date), startOfDay(date)));
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

  const handleEditEvent = (event: CalendarEvent) => {
    setEntryToEdit(event);
    setIsEditFormOpen(true);
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
        <Dialog open={isAddFormOpen} onOpenChange={setIsAddFormOpen}>
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
                setIsAddFormOpen(false);
              }}
              onCancel={() => setIsAddFormOpen(false)}
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
                    modifiersStyles={modifiersStyles}
                    classNames={calendarSpecificClassNames}
                    components={{ DayContent: CustomDayContent }}
                    numberOfMonths={typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 2}
                    className="rounded-md border w-full"
                    disabled={(date) => date < startOfDay(new Date())} 
                    defaultMonth={selectedDate || new Date()}
                    onDayClick={(day, activeModifiers) => { 
                        if (!activeModifiers.disabled || isSameDay(day, startOfDay(new Date()))) { 
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
          <CardFooter className="flex flex-wrap gap-x-4 gap-y-2 pt-4 justify-center sm:justify-start">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded" style={modifiersStyles.confirmed}></div>
              <span className="font-body text-xs">Confirmed/Paid</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded" style={modifiersStyles.manual}></div>
              <span className="font-body text-xs">Manual Booking</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded" style={modifiersStyles.blocked}></div>
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
                        {eventsOnSelectedDate.map(event => {
                           const isEditable = event.status === 'blocked' || event.status === 'manual_booking' || event.status === 'manual_confirmed';
                           return (
                            <li key={event.id} className="font-body text-sm border-b pb-2 last:border-b-0">
                                <div className="flex justify-between items-start">
                                  <p className="font-semibold">{event.name}</p>
                                  {isEditable && (
                                    <Button variant="outline" size="sm" onClick={() => handleEditEvent(event)}>
                                      <Edit className="h-3 w-3 mr-1" /> Edit
                                    </Button>
                                  )}
                                </div>
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
                                {event.notes && <p className="text-xs text-muted-foreground">Notes: {event.notes}</p>}
                            </li>
                           );
                        })}
                    </ul>
                )}
            </CardContent>
        </Card>
      </div>

      {entryToEdit && (
        <Dialog open={isEditFormOpen} onOpenChange={setIsEditFormOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Calendar Entry</DialogTitle>
              <DialogDescription>
                Modify the details for &quot;{entryToEdit.name}&quot;.
              </DialogDescription>
            </DialogHeader>
            <ManualCalendarEntryForm
              editingEntryId={entryToEdit.id}
              initialData={{ // Map CalendarEvent to ManualCalendarEntryFormValues
                entryName: entryToEdit.name,
                checkInDate: entryToEdit.checkInDate,
                checkOutDate: entryToEdit.checkOutDate,
                entryType: entryToEdit.entryType || (entryToEdit.status === 'blocked' ? 'blocked' : 'manual_booking'),
                notes: entryToEdit.notes || "",
              }}
              onSuccess={() => {
                fetchCalendarEvents();
                setIsEditFormOpen(false);
                setEntryToEdit(null);
              }}
              onCancel={() => {
                setIsEditFormOpen(false);
                setEntryToEdit(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </PageContentWrapper>
  );
}

    