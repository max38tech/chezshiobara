
import { PageTitle } from "@/components/ui/page-title";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingRequestsTable } from "@/components/specific/admin/booking-requests-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Edit, BookOpenText, Images, Lightbulb, CalendarCheck } from "lucide-react"; 

export default function AdminDashboardPage() {
  return (
    <div>
      <PageTitle className="text-3xl sm:text-4xl mb-8 text-left">Admin Dashboard</PageTitle>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-headline">Welcome, Admin!</CardTitle>
          <CardDescription className="font-body">
            This is your admin portal. Manage your B&B operations from here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="font-body">
            Current functionalities: View and manage booking requests, edit site content, and view bookings calendar.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-headline">Manage Site Content</CardTitle>
          <CardDescription className="font-body">
            Edit text and image content for various pages of your website.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button asChild variant="outline">
            <Link href="/admin/content/rules">
              <Edit className="mr-2 h-4 w-4" /> Edit House Rules
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/content/house-guide">
              <BookOpenText className="mr-2 h-4 w-4" /> Edit House Guide
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/content/gallery">
              <Images className="mr-2 h-4 w-4" /> Edit Welcome Gallery
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/content/local-tips">
              <Lightbulb className="mr-2 h-4 w-4" /> Edit Local Tips
            </Link>
          </Button>
        </CardContent>
      </Card>

       <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-headline">Booking Management</CardTitle>
          <CardDescription className="font-body">
            View incoming requests and see confirmed bookings on a calendar.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button asChild variant="outline">
            <Link href="/admin/bookings-calendar">
              <CalendarCheck className="mr-2 h-4 w-4" /> View Bookings Calendar
            </Link>
          </Button>
        </CardContent>
      </Card>

      <BookingRequestsTable />

    </div>
  );
}
