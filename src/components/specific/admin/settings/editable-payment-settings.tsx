
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { getPaymentSettings, updatePaymentSettings, type PaymentSettings } from "@/actions/payment";
import { paymentSettingsSchema, type PaymentSettingsFormValues } from "@/schemas/payment";
import { Loader2, Save, Info, AlertTriangle } from "lucide-react";
import { format } from 'date-fns';

export function EditablePaymentSettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const form = useForm<PaymentSettingsFormValues>({
    resolver: zodResolver(paymentSettingsSchema),
    defaultValues: {
      paypalEmailOrLink: "",
      isPaypalEnabled: false,
      wiseInstructions: "",
      isWiseEnabled: false,
      cardPaymentInstructions: "",
      isCardPaymentEnabled: false,
    },
  });

  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true);
      try {
        const settings = await getPaymentSettings();
        if (settings) {
          form.reset({
            paypalEmailOrLink: settings.paypalEmailOrLink || "",
            isPaypalEnabled: settings.isPaypalEnabled || false,
            wiseInstructions: settings.wiseInstructions || "",
            isWiseEnabled: settings.isWiseEnabled || false,
            cardPaymentInstructions: settings.cardPaymentInstructions || "",
            isCardPaymentEnabled: settings.isCardPaymentEnabled || false,
          });
          if (settings.updatedAt instanceof Date && !isNaN(settings.updatedAt.getTime())) {
            setLastUpdated(settings.updatedAt);
          } else {
            setLastUpdated(null);
          }
        }
      } catch (error) {
        console.error("Failed to load payment settings:", error);
        toast({
          title: "Error",
          description: "Failed to load payment settings. Please try refreshing.",
          variant: "destructive",
        });
        setLastUpdated(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, [form, toast]);

  const onSubmit = async (data: PaymentSettingsFormValues) => {
    setIsSaving(true);
    try {
      const result = await updatePaymentSettings(data);
      if (result.success) {
        toast({
          title: "Success!",
          description: result.message,
        });
        const updatedSettings = await getPaymentSettings();
        if (updatedSettings.updatedAt instanceof Date && !isNaN(updatedSettings.updatedAt.getTime())) {
          setLastUpdated(updatedSettings.updatedAt);
        } else {
          setLastUpdated(null);
        }
      } else {
        toast({
          title: "Save Failed",
          description: result.message || "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving payment settings:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while saving. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 font-body text-muted-foreground">Loading payment settings...</p>
      </div>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline">Edit Payment Method Details</CardTitle>
        {lastUpdated && !isNaN(lastUpdated.getTime()) && (
          <CardDescription className="font-body text-xs text-muted-foreground">
            Last updated: {format(lastUpdated, "PPP p")}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* PayPal Section */}
            <Card className="p-4 border-border/70">
              <FormField
                control={form.control}
                name="isPaypalEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-muted/20 mb-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base font-headline">PayPal</FormLabel>
                      <CardDescription className="font-body">Enable PayPal payments</CardDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              {form.watch("isPaypalEnabled") && (
                <FormField
                  control={form.control}
                  name="paypalEmailOrLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PayPal Email or PayPal.me Link</FormLabel>
                      <FormControl>
                        <Input placeholder="your.email@example.com or paypal.me/yourprofile" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </Card>

            {/* Wise Section */}
            <Card className="p-4 border-border/70">
              <FormField
                control={form.control}
                name="isWiseEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-muted/20 mb-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base font-headline">Wise (formerly TransferWise)</FormLabel>
                       <CardDescription className="font-body">Enable Wise payments</CardDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              {form.watch("isWiseEnabled") && (
                <FormField
                  control={form.control}
                  name="wiseInstructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wise Payment Instructions</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter your Wise account details, a link to your Wise profile, or any specific instructions for guests."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </Card>
            
            {/* Card Payment Section */}
            <Card className="p-4 border-border/70">
               <FormField
                control={form.control}
                name="isCardPaymentEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-muted/20 mb-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base font-headline">Credit/Debit Card Payments</FormLabel>
                      <CardDescription className="font-body">Enable card payment instructions</CardDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              {form.watch("isCardPaymentEnabled") && (
                <FormField
                  control={form.control}
                  name="cardPaymentInstructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instructions for Card Payments</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., 'We accept card payments via Stripe. A secure payment link will be sent separately.' OR paste a generic payment link if you have one."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                       <CardDescription className="font-body text-xs pt-1">
                        If you use Stripe/Square and have a generic payment page, you can link it here. Otherwise, explain how guests will receive a payment link.
                       </CardDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </Card>
            
            <div className="flex items-start p-4 mt-6 bg-yellow-50 border border-yellow-300 rounded-md text-yellow-800">
                <AlertTriangle className="h-6 w-6 mr-3 flex-shrink-0" />
                <div>
                    <p className="font-headline text-sm">Email Configuration Required for Sending Invoices</p>
                    <p className="text-xs font-body">
                        To send invoices via email later, ensure you have set up your <code>EMAIL_USER</code> and <code>EMAIL_PASS</code> environment variables in your <code>.env</code> file.
                        For Gmail, if 2-Step Verification is ON, <code>EMAIL_PASS</code> must be an App Password.
                    </p>
                </div>
            </div>

            <Button type="submit" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSaving || isLoading}>
              {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
              Save Payment Settings
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
