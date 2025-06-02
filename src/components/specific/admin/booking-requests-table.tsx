
"use client";

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
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
import { Loader2, Inbox, CheckCircle, XCircle, Info } from 'lucide-react';
import { format } from 'date-fns';
import { approveBookingRequest, declineBookingRequest } from '@/actions/booking';
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
  status: 'pending' | 'confirmed' | 'declined';
}

export function BookingRequestsTable() {
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});


  const fetchBookingRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const requestsCollection = collection(db, 'bookingRequests');
      const q = query(requestsCollection, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const requests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as BookingRequest));
      setBookingRequests(requests);
    } catch (err) {
      console.error("Error fetching booking requests:", err);
      setError('Failed to load booking requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingRequests();
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


  if (loading) {
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

  if (bookingRequests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Inbox className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="font-headline text-xl text-muted-foreground">No Booking Requests Yet</p>
        <p className="font-body text-sm text-muted-foreground mt-1">When users submit booking requests, they will appear here.</p>
      </div>
    );
  }

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

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Incoming Booking Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption className="font-body">A list of recent booking requests. Click Accept or Decline to manage.</TableCaption>
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
                      : 'secondary'
                    }
                    className={
                        request.status === 'confirmed' ? 'bg-green-600 text-white hover:bg-green-700'
                      : request.status === 'declined' ? ''
                      : 'bg-yellow-500 text-black hover:bg-yellow-600'
                    }
                  >
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[200px] truncate" title={request.message}>
                  {request.message || <span className="text-muted-foreground italic">No message</span>}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex gap-2 justify-center">
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={() => handleStatusUpdate(request.id, 'confirmed')}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      disabled={isUpdating[request.id] || request.status !== 'pending'}
                    >
                      {isUpdating[request.id] && request.status === 'pending' ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-1 h-4 w-4" />}
                      Accept
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleStatusUpdate(request.id, 'declined')}
                      disabled={isUpdating[request.id] || request.status !== 'pending'}
                    >
                       {isUpdating[request.id] && request.status === 'pending' ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <XCircle className="mr-1 h-4 w-4" />}
                      Decline
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
