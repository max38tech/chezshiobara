
"use client";

import { useEffect, useState, useTransition } from 'react';
import { PageContentWrapper } from "@/components/layout/page-content-wrapper";
import { PageTitle } from "@/components/ui/page-title";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { getAllCalendarEvents, type CalendarEvent } from "@/actions/booking";
import { eachDayOfInterval, startOfDay, isSameDay } from 'date-fns';
import { AlertCircle, CalendarDays, Info, PlusCircle, Edit3, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ManualCalendarEntryForm } from './manual-calendar-entry-form'; // New component

interface DayWithEvent extends Date {
  eventType?: CalendarEvent['status'];
  eventName?: string;
}

function getAllEventDates(events: CalendarEvent[]): DayWithEvent[] {
  const allDates: DayWithEvent[] = [];

  events.forEach(event => {
    const interval = {
      start: startOfDay(event.checkInDate),
      end: startOfDay(new Date(event.checkOutDate.getTime() - 24 * 60 * 60 * 1000)) // Day before checkout
    };
    
    if (interval.start <= interval.end) {
        const datesInInterval = eachDayOfInterval(interval);
        datesInInterval.forEach(date => {
          const existingDateIndex = allDates.findIndex(d => isSameDay(d, date));
          if (existingDateIndex !== -1) {
            // Prioritize guest bookings over blocks if on same day (less likely but possible)
            if (allDates[existingDateIndex].eventType === 'blocked' && event.status !== 'blocked') {
              allDates[existingDateIndex].eventType = event.status;
              allDates[existingDateIndex].eventName = event.name;
            }
          } else {
            allDates.push(Object.assign(new Date(date), { eventType: event.status, eventName: event.name }));
          }
        });
    } else if (isSameDay(interval.start, event.checkInDate)) {
        const existingDateIndex = allDates.findIndex(d => isSameDay(d, event.checkInDate));
        if (existingDateIndex !== -1) {
             if (allDates[existingDateIndex].eventType === 'blocked' && event.status !== 'blocked') {
              allDates[existingDateIndex].eventType = event.status;
              allDates[existingDateIndex].eventName = event.name;
            }
        } else {
          allDates.push(Object.assign(new Date(event.checkInDate), { eventType: event.status, eventName: event.name }));
        }
    }
  });
  return allDates;
}


export default function BookingsCalendarPage() {
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date()); // For day click
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

  const bookedDatesWithInfo = getAllEventDates(calendarEvents);
  const bookedDates = bookedDatesWithInfo.map(d => new Date(d.getFullYear(), d.getMonth(), d.getDate())); // Just the dates for 'selected'

  const dayRender = (day: Date, selectedDates: Date[], modifiers: any, dayButtonProps: any) => {
    const eventInfo = bookedDatesWithInfo.find(bd => isSameDay(bd, day));
    let dayClassName = "";
    let tooltipText = "";

    if (eventInfo) {
      tooltipText = `${eventInfo.eventName} (${eventInfo.eventType})`;
      switch (eventInfo.eventType) {
        case 'confirmed':
        case 'paid':
          dayClassName = "bg-primary text-primary-foreground hover:bg-primary/90";
          break;
        case 'blocked':
          dayClassName = "bg-destructive text-destructive-foreground hover:bg-destructive/90 opacity-70";
          break;
        case 'manual_booking':
          dayClassName = "bg-accent text-accent-foreground hover:bg-accent/90";
          break;
        default:
          dayClassName = "bg-muted text-muted-foreground";
      }
    }
    
    // Check if date is selected by the user by clicking, not related to booking status
    const isSelectedByUser = selectedDate && isSameDay(day, selectedDate);

    return (
        <div title={tooltipText} className={cn(isSelectedByUser && "ring-2 ring-ring ring-offset-2", "relative h-full w-full")}>
          <button
            {...dayButtonProps}
            className={cn(
              dayButtonProps.className,
              eventInfo && dayClassName,
              "disabled:opacity-100" // Keep booked days fully opaque
            )}
            onClick={() => setSelectedDate(day)} 
            disabled={modifiers.disabled} // Keep original disabled logic for past dates etc.
          >
            {day.getDate()}
          </button>
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
    ? calendarEvents.filter(event => 
        startOfDay(selectedDate) >= startOfDay(event.checkInDate) && 
        startOfDay(selectedDate) < startOfDay(event.checkOutDate)
      )
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
                    mode="multiple"
                    selected={bookedDates}
                    numberOfMonths={typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 2}
                    className="rounded-md border w-full"
                    disabled={(date) => date < startOfDay(new Date())} // Example: disable past dates
                    defaultMonth={bookedDates.length > 0 ? bookedDates[0] : new Date()}
                    components={{ DayContent: dayRender }}
                    onDayClick={(day, modifiers) => {
                        if (!modifiers.disabled) {
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
            <div className="flex items-center gap-2"><div className="h-4 w-4 rounded bg-primary"></div><span className="font-body text-xs">Guest Booking</span></div>
            <div className="flex items-center gap-2"><div className="h-4 w-4 rounded bg-accent"></div><span className="font-body text-xs">Manual Booking</span></div>
            <div className="flex items-center gap-2"><div className="h-4 w-4 rounded bg-destructive opacity-70"></div><span className="font-body text-xs">Blocked</span></div>
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
                                        event.status === 'confirmed' || event.status === 'paid' ? 'text-primary' :
                                        event.status === 'manual_booking' ? 'text-accent-foreground' :
                                        event.status === 'blocked' ? 'text-destructive' : ''
                                    )}>{event.status.replace('_', ' ').toUpperCase()}</span>
                                </p>
                                {/* Add Edit/Delete buttons here in future */}
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
