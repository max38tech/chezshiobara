
"use client";

import { useEffect, useState, useTransition } from 'react';
import { collection, getDocs, query, orderBy, Timestamp, doc, getDoc } from 'firebase/firestore';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Inbox, CheckCircle, XCircle, Info, RefreshCcw, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { approveBookingRequest, declineBookingRequest, calculateInvoiceDetails, type BookingCalculationRequest } from '@/actions/booking';
import { getPricingConfiguration, type ClientSafePricingConfiguration } from '@/actions/pricing';
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface BookingRequest {
  id: string;
  name: string;
  email: string;
  checkInDate: Timestamp;
  checkOutDate: Timestamp;
  guests: number;
  message?: string;
  createdAt: Timestamp;
  status: 'pending' | 'confirmed' | 'declined'; // Ensure status is strictly one of these
}

interface InvoiceDetails {
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
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});
  
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedBookingForInvoice, setSelectedBookingForInvoice] = useState<BookingRequest | null>(null);
  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetails | null>(null);
  const [isCalculatingInvoice, setIsCalculatingInvoice] = useState<Record<string, boolean>>({});
  const [pricingConfig, setPricingConfig] = useState<ClientSafePricingConfiguration | null>(null);

  const fetchBookingRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const requestsCollection = collection(db, 'bookingRequests');
      const q = query(requestsCollection, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const requests = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const status = data.status; // Get status from Firestore
        return {
          id: doc.id,
          ...data,
          // Ensure status is one of the expected values, defaulting to 'pending'
          status: (status === 'pending' || status === 'confirmed' || status === 'declined') ? status : 'pending',
        } as BookingRequest; // Type assertion
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
    // Fetch pricing configuration once when component mounts
    const fetchPricing = async () => {
      const config = await getPricingConfiguration();
      setPricingConfig(config);
    };
    fetchPricing();
  }, []);

  const handleStatusUpdate = async (requestId: string, newStatus: 'confirmed' | 'declined') => {
    setIsUpdating(prev => ({ ...prev, [requestId]: true }));
    const action = newStatus === 'confirmed' ? approveBookingRequest : declineBookingRequest;
    const result = await action(requestId);

    toast({
      title: result.success ? "Success" : "Error",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    });

    if (result.success) {
      setBookingRequests(prevRequests =>
        prevRequests.map(req =>
          req.id === requestId ? { ...req, status: newStatus } : req
        )
      );
    }
    setIsUpdating(prev => ({ ...prev, [requestId]: false }));
  };

  const handleOpenInvoiceModal = async (booking: BookingRequest) => {
    setSelectedBookingForInvoice(booking);
    setIsCalculatingInvoice(prev => ({ ...prev, [booking.id]: true }));
    setInvoiceDetails(null); // Clear previous details
    setIsInvoiceModalOpen(true);

    if (!pricingConfig) {
      toast({ title: "Error", description: "Pricing configuration not loaded.", variant: "destructive" });
      setIsCalculatingInvoice(prev => ({ ...prev, [booking.id]: false }));
      setIsInvoiceModalOpen(false);
      return;
    }

    try {
      const bookingDataForCalc: BookingCalculationRequest = {
        checkInDate: booking.checkInDate.toDate(),
        checkOutDate: booking.checkOutDate.toDate(),
        guests: booking.guests,
      };
      const details = await calculateInvoiceDetails(bookingDataForCalc, pricingConfig);
      setInvoiceDetails(details);
    } catch (e) {
      console.error("Error calculating invoice:", e);
      toast({ title: "Invoice Error", description: "Could not calculate invoice details.", variant: "destructive" });
      setInvoiceDetails(null); // Clear on error
    } finally {
      setIsCalculatingInvoice(prev => ({ ...prev, [booking.id]: false }));
    }
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
    return statusValue.charAt(0).toUpperCase() + statusValue.slice(1);
  };

  if (loading && bookingRequests.length === 0) { // Show loader only if initially loading and no data yet
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 font-body text-muted-foreground">Loading booking requests...</p>
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
          <CardTitle className="font-headline text-2xl">Incoming Booking Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption className="font-body">A list of recent booking requests. Manage their status and view invoice details.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="font-headline w-[150px]">Submitted</TableHead>
                <TableHead className="font-headline">Name</TableHead>
                <TableHead className="font-headline">Email</TableHead>
                <TableHead className="font-headline">Check-in</TableHead>
                <TableHead className="font-headline">Check-out</TableHead>
                <TableHead className="font-headline text-right">Guests</TableHead>
                <TableHead className="font-headline">Status</TableHead>
                <TableHead className="font-headline">Message</TableHead>
                <TableHead className="font-headline text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookingRequests.map((request) => (
                <TableRow key={request.id} className="font-body">
                  <TableCell>{formatDate(request.createdAt)}</TableCell>
                  <TableCell className="font-medium">{request.name}</TableCell>
                  <TableCell>
                    <a href={`mailto:${request.email}`} className="text-accent hover:text-accent/80">
                      {request.email}
                    </a>
                  </TableCell>
                  <TableCell>{formatDateOnly(request.checkInDate)}</TableCell>
                  <TableCell>{formatDateOnly(request.checkOutDate)}</TableCell>
                  <TableCell className="text-right">{request.guests}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        request.status === 'confirmed' ? 'default'
                        : request.status === 'declined' ? 'destructive'
                        : 'secondary' // Covers 'pending' and any unexpected fallback
                      }
                      className={
                          request.status === 'confirmed' ? 'bg-green-600 text-white hover:bg-green-700'
                        : request.status === 'declined' ? '' 
                        : 'bg-yellow-500 text-black hover:bg-yellow-600' // For 'pending'
                      }
                    >
                      {getDisplayStatus(request.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate" title={request.message}>
                    {request.message || <span className="text-muted-foreground italic">No message</span>}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex gap-2 justify-center items-center">
                      {/* Status Management Buttons */}
                      {request.status === 'pending' && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleStatusUpdate(request.id, 'confirmed')}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            disabled={isUpdating[request.id]}
                          >
                            {isUpdating[request.id] ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-1 h-4 w-4" />}
                            Accept
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleStatusUpdate(request.id, 'declined')}
                            disabled={isUpdating[request.id]}
                          >
                             {isUpdating[request.id] ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <XCircle className="mr-1 h-4 w-4" />}
                            Decline
                          </Button>
                        </>
                      )}
                      {request.status === 'confirmed' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleStatusUpdate(request.id, 'declined')}
                          disabled={isUpdating[request.id]}
                          title="Decline this booking"
                        >
                          {isUpdating[request.id] ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <XCircle className="mr-1 h-4 w-4" />}
                          Decline
                        </Button>
                      )}
                      {request.status === 'declined' && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleStatusUpdate(request.id, 'confirmed')}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          disabled={isUpdating[request.id]}
                          title="Re-approve this booking"
                        >
                          {isUpdating[request.id] ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-1 h-4 w-4" />}
                          Approve
                        </Button>
                      )}

                      {/* Invoice Button - Should be visible for pending and confirmed */}
                      {(request.status === 'pending' || request.status === 'confirmed') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenInvoiceModal(request)}
                          disabled={isCalculatingInvoice[request.id] || isUpdating[request.id]}
                        >
                          {isCalculatingInvoice[request.id] ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <FileText className="mr-1 h-4 w-4" />}
                          Invoice
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedBookingForInvoice && (
        <Dialog open={isInvoiceModalOpen} onOpenChange={setIsInvoiceModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-headline">Invoice Details for {selectedBookingForInvoice.name}</DialogTitle>
              <DialogDescription className="font-body">
                For stay from {formatDateOnly(selectedBookingForInvoice.checkInDate)} to {formatDateOnly(selectedBookingForInvoice.checkOutDate)} ({selectedBookingForInvoice.guests} guest(s)).
              </DialogDescription>
            </DialogHeader>
            {isCalculatingInvoice[selectedBookingForInvoice.id] && !invoiceDetails && (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-3 font-body">Calculating invoice...</p>
              </div>
            )}
            {invoiceDetails && (
              <div className="space-y-3 py-4">
                <p className="font-body"><strong className="font-headline">Total Amount:</strong> {invoiceDetails.totalAmount.toFixed(2)} {invoiceDetails.currency}</p>
                <p className="font-body"><strong className="font-headline">Applied Strategy:</strong> {invoiceDetails.appliedStrategy}</p>
                <p className="font-body text-sm text-muted-foreground"><strong className="font-headline">Breakdown:</strong> {invoiceDetails.breakdown}</p>
              </div>
            )}
            {!isCalculatingInvoice[selectedBookingForInvoice.id] && !invoiceDetails && selectedBookingForInvoice && (
                 <div className="text-destructive font-body p-4 text-center">Could not calculate invoice details. Check pricing configuration.</div>
            )}
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setIsInvoiceModalOpen(false)}>
                Close
              </Button>
              {/* Payment link button will go here later */}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
      