
"use client";

import { useEffect, useState, useTransition } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { collection, getDocs, query, orderBy, Timestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Inbox, CheckCircle, XCircle, Info, RefreshCcw, FileText, Calculator, CreditCard, Trash2, Copy } from 'lucide-react';
import { format } from 'date-fns';
import {
  approveBookingRequest,
  declineBookingRequest,
  calculateInvoiceDetails,
  updateBookingAndInvoiceDetails,
  deleteCalendarEntry,
  type BookingCalculationRequest
} from '@/actions/booking';
import { getPricingConfiguration, type ClientSafePricingConfiguration } from '@/actions/pricing';
import { getPaymentSettings, type PaymentSettings } from '@/actions/payment';
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { editableBookingInvoiceSchema, type EditableBookingInvoiceFormValues } from '@/schemas/booking';
import Link from 'next/link';

export interface BookingRequest {
  id: string;
  name: string;
  email?: string;
  checkInDate: Timestamp;
  checkOutDate: Timestamp;
  guests?: number;
  message?: string;
  createdAt: Timestamp;
  status: 'pending' | 'confirmed' | 'declined' | 'paid' | 'blocked' | 'manual_booking' | 'manual_confirmed';
  finalInvoiceAmount?: number;
  finalInvoiceCurrency?: string;
  invoiceRecipientEmail?: string;
  entryName?: string;
}

interface InvoiceCalculationResult {
  totalAmount: number;
  currency: string;
  breakdown: string;
  appliedStrategy: string;
}

export function BookingRequestsTable() {
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<Record<string, boolean>>({});
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);

  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<BookingRequest | null>(null);
  const [currentInvoiceCalculation, setCurrentInvoiceCalculation] = useState<InvoiceCalculationResult | null>(null);
  const [isCalculatingInvoice, setIsCalculatingInvoice] = useState(false);
  const [isRecalculatingInvoice, setIsRecalculatingInvoice] = useState(false);
  const [isSubmittingInvoice, startInvoiceTransition] = useTransition();
  const [pricingConfig, setPricingConfig] = useState<ClientSafePricingConfiguration | null>(null);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);


  const form = useForm<EditableBookingInvoiceFormValues>({
    resolver: zodResolver(editableBookingInvoiceSchema),
    defaultValues: {
      name: "",
      invoiceRecipientEmail: "",
      guests: 1,
      finalInvoiceAmount: 0,
    },
  });

  const fetchBookingRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const requestsCollection = collection(db, 'bookingRequests');
      // The Firestore orderBy clause can cause permission issues with certain rule/index configurations.
      // To bypass this, we fetch the data unsorted and then sort it on the client-side.
      const q = query(requestsCollection);
      const querySnapshot = await getDocs(q);
      const requests = querySnapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data();
        const status = data.status;
        const validStatusValues: BookingRequest['status'][] = ['pending', 'confirmed', 'declined', 'paid', 'blocked', 'manual_booking', 'manual_confirmed'];
        const validStatus = validStatusValues.includes(status) ? status : 'pending';
        return {
          id: docSnapshot.id,
          ...data,
          status: validStatus,
        } as BookingRequest;
      });

      // Sort requests on the client-side to ensure newest are first.
      requests.sort((a, b) => {
        const dateA = a.createdAt?.toDate() || new Date(0);
        const dateB = b.createdAt?.toDate() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });

      setBookingRequests(requests);
    } catch (err) {
      console.error("Error fetching booking requests:", err);
      setError('Failed to load booking requests. Please try again.');
      toast({ title: "Error", description: "Failed to load booking requests.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingRequests();
    const fetchInitialConfigs = async () => {
      const pConfig = await getPricingConfiguration();
      setPricingConfig(pConfig);
      const paySettings = await getPaymentSettings();
      setPaymentSettings(paySettings);
      console.log("Loaded Payment Settings:", paySettings);
    };
    fetchInitialConfigs();
  }, [toast]);

  const handleStatusUpdate = async (requestId: string, newStatus: BookingRequest['status']) => {
    setIsUpdatingStatus(prev => ({ ...prev, [requestId]: true }));

    let result;
    if (newStatus === 'confirmed') {
      result = await approveBookingRequest(requestId);
    } else if (newStatus === 'declined') {
      result = await declineBookingRequest(requestId);
    } else {
      const requestRef = doc(db, "bookingRequests", requestId);
      try {
        await updateDoc(requestRef, { status: newStatus });
        result = { success: true, message: `Booking status updated to ${newStatus}.` };
      } catch (e) {
        console.error("Error updating status:", e);
        result = { success: false, message: `Failed to update status to ${newStatus}. Error: ${e instanceof Error ? e.message : String(e)}` };
      }
    }

    toast({
      title: result.success ? "Success" : "Error",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    });

    if (result.success) {
      fetchBookingRequests();
    }
    setIsUpdatingStatus(prev => ({ ...prev, [requestId]: false }));
  };

  const handleDeleteEntry = async (entryId: string) => {
    setDeletingEntryId(entryId);
    try {
      const result = await deleteCalendarEntry(entryId);
      toast({
        title: result.success ? "Entry Deleted" : "Deletion Failed",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
      if (result.success) {
        fetchBookingRequests();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting.",
        variant: "destructive",
      });
    } finally {
      setDeletingEntryId(null);
    }
  };


  const performInvoiceCalculation = async (calcRequest: BookingCalculationRequest): Promise<InvoiceCalculationResult | null> => {
    if (!pricingConfig) {
      toast({ title: "Error", description: "Pricing configuration not loaded.", variant: "destructive" });
      return null;
    }
    try {
      const details = await calculateInvoiceDetails(calcRequest, pricingConfig);
      return details;
    } catch (e) {
      console.error("Error calculating invoice:", e);
      toast({ title: "Invoice Error", description: "Could not calculate invoice details.", variant: "destructive" });
      return null;
    }
  };

  const handleOpenInvoiceModal = async (booking: BookingRequest) => {
    setEditingBooking(booking);
    setIsCalculatingInvoice(true);
    setCurrentInvoiceCalculation(null);

    const initialCalcRequest: BookingCalculationRequest = {
      checkInDate: booking.checkInDate.toDate(),
      checkOutDate: booking.checkOutDate.toDate(),
      guests: booking.guests || 1,
    };
    const details = await performInvoiceCalculation(initialCalcRequest);

    form.reset({
      name: booking.name || booking.entryName || "",
      invoiceRecipientEmail: booking.invoiceRecipientEmail || booking.email || "",
      checkInDate: booking.checkInDate.toDate(),
      checkOutDate: booking.checkOutDate.toDate(),
      guests: booking.guests || 1,
      finalInvoiceAmount: booking.finalInvoiceAmount !== undefined ? booking.finalInvoiceAmount : (details ? details.totalAmount : 0),
    });

    if (details) {
      setCurrentInvoiceCalculation(details);
    }
    setIsCalculatingInvoice(false);
    setIsInvoiceModalOpen(true);
  };

  const handleRecalculateInvoice = async () => {
    if (!editingBooking || !pricingConfig) return;
    setIsRecalculatingInvoice(true);
    const formValues = form.getValues();
    const calcRequest: BookingCalculationRequest = {
      checkInDate: formValues.checkInDate,
      checkOutDate: formValues.checkOutDate,
      guests: Number(formValues.guests),
    };
    const details = await performInvoiceCalculation(calcRequest);
    if (details) {
      setCurrentInvoiceCalculation(details);
      form.setValue('finalInvoiceAmount', details.totalAmount);
    }
    setIsRecalculatingInvoice(false);
  };

  const onInvoiceFormSubmit = async (values: EditableBookingInvoiceFormValues) => {
     startInvoiceTransition(async () => {
        if (!editingBooking || !currentInvoiceCalculation) {
        toast({ title: "Error", description: "Missing booking or calculation details for saving.", variant: "destructive" });
        return;
        }

        const dataToUpdate = {
          ...values,
          finalInvoiceBreakdown: currentInvoiceCalculation.breakdown,
          finalInvoiceStrategy: currentInvoiceCalculation.appliedStrategy,
          finalInvoiceCurrency: currentInvoiceCalculation.currency,
        };
        
        console.log("Client: Submitting to updateBookingAndInvoiceDetails:", dataToUpdate);
        const result = await updateBookingAndInvoiceDetails(editingBooking.id, dataToUpdate);
        console.log("Client: Result from updateBookingAndInvoiceDetails:", result);

        let toastTitle = result.success ? "Success!" : "Error";
        let toastDescription = result.message;

        if (result.success && editingBooking) {
          setIsInvoiceModalOpen(false);
          toastDescription = `Invoice finalized. ${result.message}. You can now share the payment link using the 'Share' or 'Copy' buttons in the table for this booking.`;
          try {
              await fetchBookingRequests(); 
          } catch (fetchError) {
              console.error("Error refetching booking requests:", fetchError);
              toastDescription += "\n(Could not refresh booking list, please refresh manually)";
          }
        }

        toast({
            title: toastTitle,
            description: toastDescription,
            variant: result.success ? "default" : "destructive",
            duration: result.success ? 10000 : 5000,
        });
    });
  };

  const handleCopyPaymentLink = (bookingId: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
    const paymentLink = `${baseUrl}/checkout/${bookingId}`;
    navigator.clipboard.writeText(paymentLink).then(() => {
      toast({ title: "Link Copied!", description: "Payment link copied to clipboard." });
    }).catch(err => {
      toast({ title: "Copy Failed", description: "Could not copy link to clipboard.", variant: "destructive" });
      console.error('Failed to copy payment link: ', err);
    });
  };

  const formatDate = (timestamp: Timestamp | Date | undefined) => {
    if (!timestamp) return 'N/A';
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
    return format(date, 'PPP p');
  };

  const formatDateOnly = (timestamp: Timestamp | Date | undefined) => {
    if (!timestamp) return 'N/A';
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
    return format(date, 'PPP');
  };

  const getDisplayStatus = (statusValue: BookingRequest['status']) => {
    return statusValue.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (loading && bookingRequests.length === 0 && !pricingConfig && !paymentSettings) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 font-body text-muted-foreground">Loading booking requests and settings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-destructive">
        <Info className="h-8 w-8 mb-2" />
        <p className="font-body">{error}</p>
      </div>
    );
  }

  if (bookingRequests.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Inbox className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="font-headline text-xl text-muted-foreground">No Booking Requests Yet</p>
        <p className="font-body text-sm text-muted-foreground mt-1">When users submit booking requests, they will appear here.</p>
      </div>
    );
  }

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Incoming Booking Requests & Calendar Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption className="font-body">A list of recent booking requests and manual calendar entries.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="font-headline w-[150px]">Submitted</TableHead>
                <TableHead className="font-headline">Name/Entry</TableHead>
                <TableHead className="font-headline">Email</TableHead>
                <TableHead className="font-headline">Check-in</TableHead>
                <TableHead className="font-headline">Check-out</TableHead>
                <TableHead className="font-headline text-right">Guests</TableHead>
                <TableHead className="font-headline">Status</TableHead>
                <TableHead className="font-headline">Message/Notes</TableHead>
                <TableHead className="font-headline text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookingRequests.map((request) => {
                const isPayableStatus = request.status === 'confirmed' || request.status === 'manual_confirmed';
                const hasValidAmount = request.finalInvoiceAmount && request.finalInvoiceAmount > 0;
                const cardPaymentsEnabled = paymentSettings?.isCardPaymentEnabled === true;
                const showPaymentButtons = isPayableStatus && hasValidAmount && cardPaymentsEnabled;
                const isDeletableEntry = request.status === 'blocked' || request.status === 'manual_booking' || request.status === 'manual_confirmed';
                
                return (
                <TableRow key={request.id} className="font-body">
                  <TableCell>{formatDate(request.createdAt)}</TableCell>
                  <TableCell className="font-medium">{request.name || request.entryName}</TableCell>
                  <TableCell>
                    {request.email && request.email !== 'blocked@internal.com' && request.email !== 'manual@example.com' ? (
                        <a href={`mailto:${request.email}`} className="text-accent hover:text-accent/80">
                        {request.email}
                        </a>
                    ) : (
                        <span className="text-muted-foreground italic">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>{formatDateOnly(request.checkInDate)}</TableCell>
                  <TableCell>{formatDateOnly(request.checkOutDate)}</TableCell>
                  <TableCell className="text-right">{request.guests ?? <span className="text-muted-foreground italic">N/A</span>}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        request.status === 'confirmed' ? 'default'
                        : request.status === 'paid' ? 'default'
                        : request.status === 'declined' ? 'destructive'
                        : request.status === 'blocked' ? 'destructive'
                        : request.status === 'manual_booking' || request.status === 'manual_confirmed' ? 'secondary'
                        : 'secondary'
                      }
                      className={
                          request.status === 'confirmed' ? 'bg-green-600 text-white hover:bg-green-700'
                        : request.status === 'paid' ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : request.status === 'declined' ? ''
                        : request.status === 'blocked' ? 'bg-gray-500 text-white hover:bg-gray-600 opacity-80'
                        : request.status === 'manual_booking' || request.status === 'manual_confirmed' ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-yellow-500 text-black hover:bg-yellow-600'
                      }
                    >
                      {getDisplayStatus(request.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate" title={request.message || (request as any).notes}>
                    {request.message || (request as any).notes || <span className="text-muted-foreground italic">No message/notes</span>}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex gap-2 justify-center items-center flex-wrap">
                      {request.status === 'pending' && (
                        <>
                          <Button variant="default" size="sm" onClick={() => handleStatusUpdate(request.id, 'confirmed')} className="bg-green-600 hover:bg-green-700 text-white" disabled={isUpdatingStatus[request.id]}>
                            {isUpdatingStatus[request.id] ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-1 h-4 w-4" />} Accept
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleStatusUpdate(request.id, 'declined')} disabled={isUpdatingStatus[request.id]}>
                             {isUpdatingStatus[request.id] ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <XCircle className="mr-1 h-4 w-4" />} Decline
                          </Button>
                        </>
                      )}
                      {request.status === 'confirmed' && request.status !== 'paid' && (
                        <Button variant="destructive" size="sm" onClick={() => handleStatusUpdate(request.id, 'declined')} disabled={isUpdatingStatus[request.id]} title="Decline this booking">
                          {isUpdatingStatus[request.id] ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <XCircle className="mr-1 h-4 w-4" />} Decline
                        </Button>
                      )}
                       {request.status === 'paid' && (<Badge variant="default" className="bg-blue-600 text-white">Paid</Badge>)}
                      {request.status === 'declined' && (
                        <Button variant="default" size="sm" onClick={() => handleStatusUpdate(request.id, 'confirmed')} className="bg-green-600 hover:bg-green-700 text-white" disabled={isUpdatingStatus[request.id]} title="Re-approve this booking">
                          {isUpdatingStatus[request.id] ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-1 h-4 w-4" />} Approve
                        </Button>
                      )}
                      {(request.status === 'pending' || request.status === 'confirmed' || request.status === 'manual_confirmed') && request.status !== 'paid' && request.status !== 'blocked' && (
                        <Button variant="outline" size="sm" onClick={() => handleOpenInvoiceModal(request)} disabled={isCalculatingInvoice || isUpdatingStatus[request.id]}>
                          {isCalculatingInvoice && editingBooking?.id === request.id ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <FileText className="mr-1 h-4 w-4" />}
                          Finalize Invoice
                        </Button>
                      )}
                       {showPaymentButtons && (
                        <div className="flex items-center gap-1">
                          <Button asChild variant="default" size="sm" className="bg-primary hover:bg-primary/80 text-primary-foreground">
                            <Link href={`/checkout/${request.id}`} target="_blank">
                              <CreditCard className="mr-1 h-4 w-4" /> Share Link
                            </Link>
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleCopyPaymentLink(request.id)} title="Copy payment link">
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                       {isDeletableEntry && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" disabled={deletingEntryId === request.id} title="Delete this entry">
                              {deletingEntryId === request.id ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Trash2 className="mr-1 h-4 w-4" />}
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action will permanently delete the calendar entry for &quot;{request.name || request.entryName}&quot;. This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteEntry(request.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                                Delete Entry
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                       )}
                    </div>
                  </TableCell>
                </TableRow>
              );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {editingBooking && (
        <Dialog open={isInvoiceModalOpen} onOpenChange={(isOpen) => {
          if (!isOpen) {
            form.reset({});
            setCurrentInvoiceCalculation(null);
            setEditingBooking(null);
          }
          setIsInvoiceModalOpen(isOpen);
        }}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-headline">Edit & Finalize Invoice for {editingBooking.name || editingBooking.entryName}</DialogTitle>
              <DialogDescription className="font-body">
                Adjust booking details and finalize the invoice amount. Original request: {formatDateOnly(editingBooking.checkInDate)} to {formatDateOnly(editingBooking.checkOutDate)} for {editingBooking.guests || 'N/A'} guest(s).
                 {editingBooking.finalInvoiceAmount && <span className="block mt-1">Current finalized amount: {editingBooking.finalInvoiceAmount.toFixed(2)} {editingBooking.finalInvoiceCurrency}</span>}
              </DialogDescription>
            </DialogHeader>
            {isCalculatingInvoice && !currentInvoiceCalculation && editingBooking.finalInvoiceAmount === undefined ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-3 font-body">Calculating initial invoice...</p>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onInvoiceFormSubmit)} className="space-y-4 py-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Guest Name / Entry Name</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="invoiceRecipientEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Invoice Recipient Email (if applicable)</FormLabel>
                        <FormControl><Input type="email" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="checkInDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Check-in Date</FormLabel>
                          <DatePicker
                            value={field.value}
                            onChange={(date) => {
                              field.onChange(date);
                              const currentCheckout = form.getValues("checkOutDate");
                              if (date && currentCheckout && currentCheckout <= date) {
                                form.setValue("checkOutDate", undefined, {shouldValidate: true});
                              }
                            }}
                            placeholder="Select check-in"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="checkOutDate"
                      render={({ field }) => {
                        const watchedCheckInDate = form.watch("checkInDate");
                        return (
                          <FormItem className="flex flex-col">
                            <FormLabel>Check-out Date</FormLabel>
                            <DatePicker
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Select check-out"
                              fromDate={watchedCheckInDate ? new Date(watchedCheckInDate.getTime() + 86400000) : undefined }
                            />
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  </div>
                   <FormField
                    control={form.control}
                    name="guests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Guests (if applicable)</FormLabel>
                        <FormControl><Input type="number" min="0" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {currentInvoiceCalculation && (
                    <Card className="bg-muted/50 p-3 my-3">
                      <p className="font-body text-sm"><strong className="font-headline">Calculated Total:</strong> {currentInvoiceCalculation.totalAmount.toFixed(2)} {currentInvoiceCalculation.currency}</p>
                      <p className="font-body text-xs text-muted-foreground"><strong className="font-headline">Strategy:</strong> {currentInvoiceCalculation.appliedStrategy}</p>
                      <p className="font-body text-xs text-muted-foreground"><strong className="font-headline">Breakdown:</strong> {currentInvoiceCalculation.breakdown}</p>
                    </Card>
                  )}

                  <Button type="button" variant="outline" size="sm" onClick={handleRecalculateInvoice} disabled={isRecalculatingInvoice || !pricingConfig || !editingBooking } className="w-full">
                    {isRecalculatingInvoice ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calculator className="mr-2 h-4 w-4" />}
                    Recalculate Based on Above Dates/Guests
                  </Button>

                  <FormField
                    control={form.control}
                    name="finalInvoiceAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Final Invoice Amount ({pricingConfig?.currency || 'USD'})</FormLabel>
                        <FormControl><Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter className="pt-4 flex flex-col sm:flex-row sm:justify-end items-center gap-2">
                        <Button type="button" variant="ghost" onClick={() => setIsInvoiceModalOpen(false)} disabled={isSubmittingInvoice}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmittingInvoice || isRecalculatingInvoice} className="bg-primary hover:bg-primary/80 text-primary-foreground">
                        {isSubmittingInvoice ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Invoice"}
                        </Button>
                  </DialogFooter>
                </form>
              </Form>
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
