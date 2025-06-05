
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { manualCalendarEntrySchema, type ManualCalendarEntryFormValues } from "@/schemas/booking";
import { addManualCalendarEntry } from "@/actions/booking";
import { Loader2 } from "lucide-react";
import { DialogFooter } from "@/components/ui/dialog"; // Added DialogFooter import

interface ManualCalendarEntryFormProps {
  onSuccess: () => void;
  initialData?: Partial<ManualCalendarEntryFormValues>; // For editing in future
}

export function ManualCalendarEntryForm({ onSuccess, initialData }: ManualCalendarEntryFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [selectedCheckInDate, setSelectedCheckInDate] = useState<Date | undefined>(initialData?.checkInDate);

  const form = useForm<ManualCalendarEntryFormValues>({
    resolver: zodResolver(manualCalendarEntrySchema),
    defaultValues: initialData || {
      entryName: "",
      entryType: "blocked",
      notes: "",
    },
  });

  const onSubmit = (values: ManualCalendarEntryFormValues) => {
    startTransition(async () => {
      try {
        const result = await addManualCalendarEntry(values);
        if (result.success) {
          toast({
            title: "Entry Added!",
            description: result.message,
          });
          form.reset();
          setSelectedCheckInDate(undefined); 
          onSuccess();
        } else {
          toast({
            title: "Submission Failed",
            description: result.message || "An unexpected error occurred.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
        <FormField
          control={form.control}
          name="entryName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name / Description</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Vacation, Smith Party, Maintenance" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="entryType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Entry Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select entry type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="blocked">Blocked (Personal, Maintenance)</SelectItem>
                  <SelectItem value="manual_booking">Manual Booking (Direct)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="checkInDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date</FormLabel>
                <DatePicker
                  value={field.value}
                  onChange={(date) => {
                    field.onChange(date);
                    setSelectedCheckInDate(date);
                    // If checkout is before new checkin, clear checkout
                    const currentCheckout = form.getValues("checkOutDate");
                    if (date && currentCheckout && currentCheckout <= date) {
                        form.setValue("checkOutDate", undefined, {shouldValidate: true});
                    }
                  }}
                  placeholder="Select start date"
                  fromDate={new Date()} 
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="checkOutDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date</FormLabel>
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select end date"
                  fromDate={selectedCheckInDate ? new Date(selectedCheckInDate.getTime() + 86400000) : new Date(new Date().getTime() + 86400000)} 
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any internal notes for this entry?"
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="submit" className="w-full md:w-auto" disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Add Calendar Entry"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
