
import { PageTitle } from "@/components/ui/page-title";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboardPage() {
  return (
    <div>
      <PageTitle className="text-3xl sm:text-4xl mb-6 text-left">Admin Dashboard</PageTitle>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Welcome, Admin!</CardTitle>
          <CardDescription className="font-body">
            This is your admin portal. More features will be added here soon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="font-body">
            From here, you will eventually be able to manage bookings, update site content, and more.
          </p>
          <p className="font-body mt-4">
            Current functionalities to be implemented:
          </p>
          <ul className="list-disc list-inside font-body mt-2 space-y-1">
            <li>View and manage booking requests</li>
            <li>Manage photos for the welcome page gallery</li>
            <li>Edit text content for various pages (Rules, House Guide, etc.)</li>
            <li>View a calendar of confirmed bookings</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

