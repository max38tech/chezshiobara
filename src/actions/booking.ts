"use server";

import type { BookingRequestFormValues } from "@/schemas/booking";

export async function handleBookingRequest(data: BookingRequestFormValues) {
  console.log("Booking request received:", data);
  
  // Simulate API call / payment processing / database interaction
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Simulate success or failure for demonstration
  // In a real app, this would involve checking availability, processing payment, etc.
  if (data.name.toLowerCase() === "error") { // Simple way to test error state
     return { success: false, message: "Simulated booking error: Could not process your request." };
  }
  
  if (Math.random() > 0.1) { // 90% success rate
    return { 
      success: true, 
      message: "Your booking request has been submitted! We will contact you shortly to confirm availability and payment." 
    };
  } else {
    return { 
      success: false, 
      message: "We encountered an issue submitting your booking request. Please try again or contact us directly." 
    };
  }
}
