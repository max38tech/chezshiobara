
import { PageTitle } from "@/components/ui/page-title";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingRequestsTable } from "@/components/specific/admin/booking-requests-table";

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
            Current functionalities: View booking requests.
          </p>
          <p className="font-body mt-2">
            Upcoming features:
          </p>
          <ul className="list-disc list-inside font-body mt-1 space-y-1 text-sm">
            <li>Accept/Decline booking requests</li>
            <li>Manage photos for the welcome page gallery</li>
            <li>Edit text content for various pages (Rules, House Guide, etc.)</li>
            <li>View a calendar of confirmed bookings</li>
          </ul>
        </CardContent>
      </Card>

      <BookingRequestsTable />

    </div>
  );
}
