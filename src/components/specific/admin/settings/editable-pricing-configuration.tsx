
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { getPricingConfiguration, updatePricingConfiguration, type ClientSafePricingConfiguration } from "@/actions/pricing";
import { pricingConfigurationSchema, type PricingConfigurationFormValues } from "@/schemas/pricing";
import { Loader2, Save, Info } from "lucide-react";
import { format } from 'date-fns';

export function EditablePricingConfiguration() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentCurrency, setCurrentCurrency] = useState<string>("USD");
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
          form.reset({
            perNight1Person: config.perNight1Person,
            perNight2People: config.perNight2People,
            perWeek1Person: config.perWeek1Person,
            perWeek2People: config.perWeek2People,
            perMonth1Person: config.perMonth1Person,
            perMonth2People: config.perMonth2People,
          });
          setCurrentCurrency(config.currency);
          if (config.updatedAt instanceof Date && !isNaN(config.updatedAt.getTime())) {
            setLastUpdated(config.updatedAt);
          } else {
            setLastUpdated(null);
          }
        }
      } catch (error) {
        console.error("Failed to load pricing configuration:", error);
        toast({
          title: "Error",
          description: "Failed to load pricing configuration. Please try refreshing.",
          variant: "destructive",
        });
        setLastUpdated(null);
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
        const updatedConfig = await getPricingConfiguration(); 
         if (updatedConfig.updatedAt instanceof Date && !isNaN(updatedConfig.updatedAt.getTime())) {
            setLastUpdated(updatedConfig.updatedAt);
        } else {
            setLastUpdated(null);
        }
        // Update current currency if it changed (though it's not editable in this form)
        setCurrentCurrency(updatedConfig.currency);
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
            {lastUpdated && !isNaN(lastUpdated.getTime()) && (
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
                            <Input type="number" placeholder="e.g., 80" {...field} />
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
                            <Input type="number" placeholder="e.g., 120" {...field} />
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
                            <Input type="number" placeholder="e.g., 500" {...field} />
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
                            <Input type="number" placeholder="e.g., 770" {...field} />
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
                            <Input type="number" placeholder="e.g., 1800" {...field} />
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
                            <Input type="number" placeholder="e.g., 2700" {...field} />
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

