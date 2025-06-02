
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
import { Button } from '@/components/ui/button'; // Added Button
import { Loader2, Inbox, CheckCircle, XCircle } from 'lucide-react'; // Added icons
import { format } from 'date-fns';

interface BookingRequest {
  id: string;
  name: string;
  email: string;
  checkInDate: Timestamp;
  checkOutDate: Timestamp;
  guests: number;
  message?: string;
  createdAt: Timestamp;
  // We'll likely add a 'status' field here later (e.g., 'pending', 'confirmed', 'declined')
}

export function BookingRequestsTable() {
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookingRequests = async () => {
      setLoading(true);
      setError(null);
      try {
        const requestsCollection = collection(db, 'bookingRequests');
        // Assuming we'll want to see all requests, regardless of status for now.
        // Later we might filter by status: e.g., where('status', '==', 'pending')
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

    fetchBookingRequests();
  }, []);

  const handleAccept = (requestId: string) => {
    console.log(`Accept booking request with ID: ${requestId}`);
    // Here we would typically call a server action to update Firestore
    // e.g., updateDoc(doc(db, "bookingRequests", requestId), { status: "confirmed" });
    // And then potentially re-fetch or update local state
  };

  const handleDecline = (requestId: string) => {
    console.log(`Decline booking request with ID: ${requestId}`);
    // Similar to accept, call a server action to update status to "declined"
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
    return format(date, 'PPP p'); // e.g., Jun 20, 2024 10:30 AM
  };
  
  const formatDateOnly = (timestamp: Timestamp | Date | undefined) => {
    if (!timestamp) return 'N/A';
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
    return format(date, 'PPP'); // e.g., Jun 20, 2024
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
                <TableCell className="max-w-[200px] truncate" title={request.message}>
                  {request.message || <span className="text-muted-foreground italic">No message</span>}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex gap-2 justify-center">
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={() => handleAccept(request.id)}
                      className="bg-green-600 hover:bg-green-700 text-white" // Example custom styling
                    >
                      <CheckCircle className="mr-1 h-4 w-4" />
                      Accept
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDecline(request.id)}
                    >
                      <XCircle className="mr-1 h-4 w-4" />
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
