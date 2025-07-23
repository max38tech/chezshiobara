"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageTitle } from "@/components/ui/page-title";
import { Separator } from "@/components/ui/separator";
import { BookOpen, CalendarCheck, CreditCard, DollarSign, Edit3, ImageIcon, Mail, MapPin, ScrollText, Shield, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { BookingRequestsTable } from "@/components/specific/admin/booking-requests-table";

export default function AdminDashboard() {
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
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/admin/content/welcome" className="flex items-center p-3 rounded-md hover:bg-muted transition-colors">
              <Edit3 className="w-5 h-5 mr-3" />
              <span>Edit Welcome Text</span>
            </Link>
            <Link href="/admin/content/gallery" className="flex items-center p-3 rounded-md hover:bg-muted transition-colors">
              <ImageIcon className="w-5 h-5 mr-3" />
              <span>Edit Welcome Gallery</span>
            </Link>
            <Link href="/admin/content/who-we-are" className="flex items-center p-3 rounded-md hover:bg-muted transition-colors">
              <Users className="w-5 h-5 mr-3" />
              <span>Edit Who We Are</span>
            </Link>
            <Link href="/admin/content/rules" className="flex items-center p-3 rounded-md hover:bg-muted transition-colors">
              <Edit3 className="w-5 h-5 mr-3" />
              <span>Edit House Rules</span>
            </Link>
            <Link href="/admin/content/house-guide" className="flex items-center p-3 rounded-md hover:bg-muted transition-colors">
              <BookOpen className="w-5 h-5 mr-3" />
              <span>Edit House Guide</span>
            </Link>
            <Link href="/admin/content/local-tips" className="flex items-center p-3 rounded-md hover:bg-muted transition-colors">
              <MapPin className="w-5 h-5 mr-3" />
              <span>Edit Local Tips</span>
            </Link>
            <Link href="/admin/content/invoice-email" className="flex items-center p-3 rounded-md hover:bg-muted transition-colors">
                <Mail className="w-5 h-5 mr-3" />
                <span>Edit Invoice Email</span>
            </Link>
            <Link href="/admin/content/commerce-disclosure" className="flex items-center p-3 rounded-md hover:bg-muted transition-colors">
              <Shield className="w-5 h-5 mr-3" />
              <span>Edit Commerce Disclosure</span>
            </Link>
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
