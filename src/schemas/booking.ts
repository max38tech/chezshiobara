
import { z } from "zod";

export const bookingRequestSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters long." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  checkInDate: z.date({ required_error: "Check-in date is required." }),
  checkOutDate: z.date({ required_error: "Check-out date is required." }),
  guests: z.coerce.number()
    .min(1, { message: "At least 1 guest is required." })
    .max(10, { message: "Maximum 10 guests allowed." }), // Example max guests
  message: z.string().max(500, { message: "Message cannot exceed 500 characters."}).optional(),
}).refine(data => data.checkOutDate > data.checkInDate, {
  message: "Check-out date must be after check-in date.",
  path: ["checkOutDate"], // Point error to checkOutDate field
});

export type BookingRequestFormValues = z.infer<typeof bookingRequestSchema>;

export const editableBookingInvoiceSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters long." }),
  invoiceRecipientEmail: z.string().email({ message: "Please enter a valid email address for the invoice." }),
  checkInDate: z.date({ required_error: "Check-in date is required." }),
  checkOutDate: z.date({ required_error: "Check-out date is required." }),
  guests: z.coerce.number().min(1, { message: "At least 1 guest is required." }),
  finalInvoiceAmount: z.coerce.number().positive({ message: "Invoice amount must be a positive number." }),
  finalInvoiceBreakdown: z.string().optional(),
  finalInvoiceStrategy: z.string().optional(),
  finalInvoiceCurrency: z.string().optional(),
}).refine(data => data.checkOutDate > data.checkInDate, {
  message: "Check-out date must be after check-in date.",
  path: ["checkOutDate"],
});

export type EditableBookingInvoiceFormValues = z.infer<typeof editableBookingInvoiceSchema>;

export const manualCalendarEntrySchema = z.object({
  entryName: z.string().min(2, { message: "Entry name or description must be at least 2 characters."}),
  checkInDate: z.date({ required_error: "Check-in date is required." }),
  checkOutDate: z.date({ required_error: "Check-out date is required." }),
  entryType: z.enum(["blocked", "manual_booking"], { required_error: "Entry type is required."}),
  notes: z.string().max(300, "Notes cannot exceed 300 characters.").optional(),
}).refine(data => data.checkOutDate > data.checkInDate, {
  message: "End date must be after start date.",
  path: ["checkOutDate"],
});

export type ManualCalendarEntryFormValues = z.infer<typeof manualCalendarEntrySchema>;
