
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { getPricingConfiguration, updatePricingConfiguration, type PricingConfiguration } from "@/actions/pricing";
import { pricingConfigurationSchema, type PricingConfigurationFormValues } from "@/schemas/pricing";
import { Loader2, Save, Info } from "lucide-react";
import { format } from 'date-fns';

export function EditablePricingConfiguration() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentCurrency, setCurrentCurrency] = useState<string>("JPY");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const form = useForm<PricingConfigurationFormValues>({
    resolver: zodResolver(pricingConfigurationSchema),
    defaultValues: {
      perNight1Person: 0,
      perNight2People: 0,
      perWeek1Person: 0,
      perWeek2People: 0,
      perMonth1Person: 0,
      perMonth2People: 0,
    },
  });

  useEffect(() => {
    async function loadPricing() {
      setIsLoading(true);
      try {
        const config = await getPricingConfiguration();
        if (config) {
          form.reset(config);
          setCurrentCurrency(config.currency);
          if (config.updatedAt) {
            // Firestore Timestamp to JS Date
            const updatedDate = (config.updatedAt as any).toDate ? (config.updatedAt as any).toDate() : new Date(config.updatedAt as any);
            setLastUpdated(updatedDate);
          }
        }
      } catch (error) {
        console.error("Failed to load pricing configuration:", error);
        toast({
          title: "Error",
          description: "Failed to load pricing configuration. Please try refreshing.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadPricing();
  }, [form, toast]);

  const onSubmit = async (data: PricingConfigurationFormValues) => {
    setIsSaving(true);
    try {
      const result = await updatePricingConfiguration(data);
      if (result.success) {
        toast({
          title: "Success!",
          description: result.message,
        });
        const updatedConfig = await getPricingConfiguration(); // Re-fetch to get new timestamp
         if (updatedConfig.updatedAt) {
            const updatedDate = (updatedConfig.updatedAt as any).toDate ? (updatedConfig.updatedAt as any).toDate() : new Date(updatedConfig.updatedAt as any);
            setLastUpdated(updatedDate);
          }
      } else {
        toast({
          title: "Save Failed",
          description: result.message || "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving pricing configuration:", error);
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
        <p className="ml-2 font-body text-muted-foreground">Loading pricing settings...</p>
      </div>
    );
  }

  return (
    <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="font-headline">Edit Prices (Currency: {currentCurrency})</CardTitle>
            {lastUpdated && (
              <CardDescription className="font-body text-xs text-muted-foreground">
                Last updated: {format(lastUpdated, "PPP p")}
              </CardDescription>
            )}
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <FormField
                        control={form.control}
                        name="perNight1Person"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nightly Rate (1 Person)</FormLabel>
                            <FormControl>
                            <Input type="number" placeholder="e.g., 8000" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="perNight2People"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nightly Rate (2 People)</FormLabel>
                            <FormControl>
                            <Input type="number" placeholder="e.g., 12000" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="perWeek1Person"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Weekly Rate (1 Person)</FormLabel>
                            <FormControl>
                            <Input type="number" placeholder="e.g., 50000" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="perWeek2People"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Weekly Rate (2 People)</FormLabel>
                            <FormControl>
                            <Input type="number" placeholder="e.g., 77000" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="perMonth1Person"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Monthly Rate (1 Person)</FormLabel>
                            <FormControl>
                            <Input type="number" placeholder="e.g., 180000" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="perMonth2People"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Monthly Rate (2 People)</FormLabel>
                            <FormControl>
                            <Input type="number" placeholder="e.g., 270000" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
                <div className="flex items-center p-4 mt-6 bg-blue-50 border border-blue-200 rounded-md">
                    <Info className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0" />
                    <p className="text-sm text-blue-700 font-body">
                        All prices are in {currentCurrency}. The currency cannot be changed from this interface currently. 
                        Weekly and monthly rates are total prices for the respective period.
                    </p>
                </div>
                <Button type="submit" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSaving || isLoading}>
                    {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                    Save Pricing
                </Button>
            </form>
            </Form>
        </CardContent>
    </Card>
  );
}
