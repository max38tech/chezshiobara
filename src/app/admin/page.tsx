
import { PageTitle } from "@/components/ui/page-title";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingRequestsTable } from "@/components/specific/admin/booking-requests-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Edit, BookOpenText, Images, Lightbulb, CalendarCheck, Settings, DollarSign, CreditCard, ShieldCheck, Users, Home } from "lucide-react"; 

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
            Current functionalities: View and manage booking requests, edit site content, view bookings calendar, and manage pricing.
          </p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Manage Site Content</CardTitle>
            <CardDescription className="font-body">
              Edit text and image content for various pages of your website.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button asChild variant="outline">
              <Link href="/admin/content/welcome-page-text">
                <Home className="mr-2 h-4 w-4" /> Edit Welcome Text
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/content/gallery">
                <Images className="mr-2 h-4 w-4" /> Edit Welcome Gallery
              </Link>
            </Button>
             <Button asChild variant="outline">
              <Link href="/admin/content/who-we-are">
                <Users className="mr-2 h-4 w-4" /> Edit Who We Are
              </Link>
            </Button>
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
              <Link href="/admin/content/local-tips">
                <Lightbulb className="mr-2 h-4 w-4" /> Edit Local Tips
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/content/commerce-disclosure">
                <ShieldCheck className="mr-2 h-4 w-4" /> Edit Commerce Disclosure
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Business Settings</CardTitle>
            <CardDescription className="font-body">
              Configure core business settings like pricing and payment methods.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button asChild variant="outline">
              <Link href="/admin/settings/pricing">
                <DollarSign className="mr-2 h-4 w-4" /> Manage Pricing
              </Link>
            </Button>
             <Button asChild variant="outline">
              <Link href="/admin/settings/payment-methods">
                <CreditCard className="mr-2 h-4 w-4" /> Payment Methods
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">View Live Site Pages</CardTitle>
            <CardDescription className="font-body">
              Review important static and dynamic pages as guests see them.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button asChild variant="outline">
              <Link href="/commerce-disclosure" target="_blank" rel="noopener noreferrer">
                <ShieldCheck className="mr-2 h-4 w-4" /> View Commerce Disclosure
              </Link>
            </Button>
            {/* Add links to Privacy Policy and Terms of Service here when created */}
          </CardContent>
        </Card>
      </div>


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
          {/* Future: Link to "Create Invoice" or similar if it becomes a separate page */}
        </CardContent>
      </Card>

      <BookingRequestsTable />

    </div>
  );
}
