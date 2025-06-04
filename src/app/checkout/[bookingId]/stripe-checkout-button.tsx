
"use client";

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { createCheckoutSession } from '@/actions/stripe';
import { loadStripe } from '@stripe/stripe-js';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CreditCard } from 'lucide-react';

interface StripeCheckoutButtonProps {
  bookingId: string;
  stripePublishableKey: string;
}

export function StripeCheckoutButton({ bookingId, stripePublishableKey }: StripeCheckoutButtonProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [stripePromise, setStripePromise] = useState(() => loadStripe(stripePublishableKey));

  const handlePayment = async () => {
    startTransition(async () => {
      const stripe = await stripePromise;
      if (!stripe) {
        toast({ title: "Error", description: "Stripe.js failed to load.", variant: "destructive" });
        return;
      }

      const response = await createCheckoutSession(bookingId);

      if (response.error) {
        toast({ title: "Payment Error", description: response.error, variant: "destructive" });
        return;
      }

      if (response.sessionId) {
        const { error: stripeError } = await stripe.redirectToCheckout({
          sessionId: response.sessionId,
        });

        if (stripeError) {
          console.error("Stripe redirect error:", stripeError);
          toast({ title: "Redirect Error", description: stripeError.message || "Failed to redirect to Stripe.", variant: "destructive" });
        }
      }
    });
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={isPending || !stripePublishableKey}
      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
      size="lg"
    >
      {isPending ? (
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      ) : (
        <CreditCard className="mr-2 h-5 w-5" />
      )}
      Proceed to Secure Payment
    </Button>
  );
}
