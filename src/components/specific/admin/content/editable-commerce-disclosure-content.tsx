
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { 
  getCommerceDisclosureContent, 
  updateCommerceDisclosureContent, 
  type CommerceDisclosureContent 
} from "@/actions/content";
import { 
  commerceDisclosureContentSchema, 
  type CommerceDisclosureContentFormValues 
} from "@/schemas/content";
import { Loader2, Save } from "lucide-react";
import { format } from 'date-fns';

type FormFieldConfig = {
  name: keyof CommerceDisclosureContentFormValues;
  label: string;
  placeholder: string;
  component: typeof Input | typeof Textarea;
  rows?: number;
  description?: string;
};

const formFieldsConfig: FormFieldConfig[] = [
  { name: "businessName", label: "Business Name", placeholder: "e.g., Chez Shiobara B&B", component: Input },
  { name: "legalName", label: "Legal Name (Optional)", placeholder: "e.g., Your Full Name", component: Input },
  { name: "businessAddress", label: "Business Address", placeholder: "Street, City, Country", component: Textarea, rows: 3 },
  { name: "contactEmail", label: "Contact Email", placeholder: "e.g., us@shiobara.love", component: Input },
  { name: "contactPhone", label: "Contact Phone", placeholder: "e.g., +81 070 9058 2258", component: Input },
  { name: "businessRegistrationInfo", label: "Business Registration Information", placeholder: "Legal entity name, registration number, etc.", component: Textarea, rows: 4, description: "Include disclaimers if needed." },
  { name: "descriptionOfGoods", label: "Description of Goods and Services", placeholder: "Describe what your B&B offers.", component: Textarea, rows: 4 },
  { name: "transactionCurrencyInfo", label: "Transaction Currency Information", placeholder: "e.g., All prices in USD...", component: Textarea, rows: 3 },
  { name: "paymentMethodsInfo", label: "Payment Methods Accepted", placeholder: "e.g., Cards via Stripe, PayPal...", component: Textarea, rows: 4 },
  { name: "refundCancellationPolicy", label: "Refund and Cancellation Policy", placeholder: "Detail your cancellation terms and refund conditions.", component: Textarea, rows: 8, description: "This is a critical section. Be very specific." },
  { name: "deliveryShippingPolicy", label: "Delivery / Shipping Policy", placeholder: "e.g., Services are electronic/in-person, no shipping.", component: Textarea, rows: 3 },
  { name: "privacyPolicySummary", label: "Privacy Policy Summary", placeholder: "Summarize how you handle guest data.", component: Textarea, rows: 6, description: "Recommend linking to a full policy if available." },
  { name: "termsOfServiceSummary", label: "Terms of Service Summary", placeholder: "Summarize key terms of using your service.", component: Textarea, rows: 6, description: "Recommend linking to full ToS if available." },
  { name: "exportRestrictionsInfo", label: "Export Restrictions", placeholder: "e.g., Not applicable for services.", component: Textarea, rows: 2 },
  { name: "customerServiceContactInfo", label: "Customer Service Contact Details", placeholder: "How guests can reach you for support.", component: Textarea, rows: 4 },
];


export function EditableCommerceDisclosureContent() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | string | null>(null);

  const form = useForm<CommerceDisclosureContentFormValues>({
    resolver: zodResolver(commerceDisclosureContentSchema),
    defaultValues: async () => {
      setIsLoading(true);
      try {
        const content = await getCommerceDisclosureContent();
        if (content.updatedAt && content.updatedAt instanceof Date && !isNaN(content.updatedAt.getTime())) {
            setLastUpdated(content.updatedAt);
        } else {
            setLastUpdated("Not yet saved with timestamp.");
        }
        // Remove updatedAt before setting form defaults
        const { updatedAt, ...formData } = content;
        return {
            ...formData,
            legalName: formData.legalName || "", // Ensure optional field has a default string value for form
        };
      } catch (error) {
        console.error("Failed to load commerce disclosure content for form:", error);
        toast({
          title: "Error",
          description: "Failed to load content. Please try refreshing.",
          variant: "destructive",
        });
        setLastUpdated(null);
        // Return empty strings or placeholders for defaultValues on error
        return formFieldsConfig.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {} as CommerceDisclosureContentFormValues);
      } finally {
        setIsLoading(false);
      }
    },
  });
  
  useEffect(() => {
    // This effect ensures that after the async defaultValues are resolved,
    // the form state is updated if it hasn't been already.
    // This is particularly useful if the component mounts before defaultValues promise resolves.
    if (!isLoading && form.formState.isDirty === false && Object.keys(form.getValues()).length > 0) {
      // console.log("Form reset possibly triggered by useEffect after async defaultValues");
      // No explicit reset here, defaultValues should handle it.
      // This log can help debug if values are not populating.
    }
  }, [isLoading, form]);


  const onSubmit = async (data: CommerceDisclosureContentFormValues) => {
    setIsSaving(true);
    try {
      const dataToSave = {
        ...data,
        legalName: data.legalName === "" ? undefined : data.legalName, // Save as undefined if empty string
      };
      const result = await updateCommerceDisclosureContent(dataToSave);
      if (result.success) {
        toast({
          title: "Success!",
          description: result.message,
        });
        // Re-fetch to get the new updatedAt timestamp
        const updatedContent = await getCommerceDisclosureContent();
        if (updatedContent.updatedAt && updatedContent.updatedAt instanceof Date) {
          setLastUpdated(updatedContent.updatedAt);
        }
         form.reset({
            ...updatedContent,
            legalName: updatedContent.legalName || "", // Ensure form value is string
        });
      } else {
        toast({
          title: "Save Failed",
          description: result.message || "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving commerce disclosure content:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while saving. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && !form.formState.isDirty) { // Only show main loader if not yet interacted and loading initial
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 font-body text-muted-foreground">Loading content editor...</p>
      </div>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline">Edit Disclosure Details</CardTitle>
        {lastUpdated && (
          <CardDescription className="font-body text-xs text-muted-foreground">
            Last saved: {lastUpdated instanceof Date ? format(lastUpdated, "PPP p") : lastUpdated}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {formFieldsConfig.map(({ name, label, placeholder, component: FieldComponent, rows, description }) => (
              <FormField
                key={name}
                control={form.control}
                name={name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                      <FieldComponent
                        placeholder={placeholder}
                        rows={FieldComponent === Textarea ? rows : undefined}
                        className={FieldComponent === Textarea ? "min-h-[60px]" : ""}
                        {...field}
                      />
                    </FormControl>
                    {description && <p className="text-xs text-muted-foreground pt-1">{description}</p>}
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            
            <Button type="submit" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground mt-6" disabled={isSaving || isLoading && !form.formState.isDirty}>
              {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
              Save Disclosure Content
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

