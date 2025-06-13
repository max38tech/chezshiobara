
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { 
  getWelcomePageTextContent, 
  updateWelcomePageTextContent,
  type WelcomePageTextContent
} from "@/actions/content";
import { 
  welcomePageTextContentSchema, 
  type WelcomePageTextContentFormValues 
} from "@/schemas/content";
import { Loader2, Save } from "lucide-react";
import { format } from 'date-fns';

type FormFieldConfig = {
  name: keyof WelcomePageTextContentFormValues;
  label: string;
  placeholder: string;
  component: typeof Input | typeof Textarea;
  rows?: number;
  sectionTitle?: string;
};

const formFieldsConfig: FormFieldConfig[] = [
  { sectionTitle: "Main Introduction", name: "introParagraph", label: "Introductory Paragraph", placeholder: "e.g., Discover a hidden gem...", component: Textarea, rows: 5 },
  { sectionTitle: "Explore Section", name: "exploreSectionTitle", label: "Section Title for 'Explore Our B&B'", placeholder: "e.g., Explore Our B&B", component: Input },
  { name: "exploreCard1Title", label: "Card 1 Title", placeholder: "e.g., Comfortable Guest Room", component: Input },
  { name: "exploreCard1Description", label: "Card 1 Description", placeholder: "Description for the first card...", component: Textarea, rows: 3 },
  { name: "exploreCard2Title", label: "Card 2 Title", placeholder: "e.g., Explore the Region", component: Input },
  { name: "exploreCard2Description", label: "Card 2 Description", placeholder: "Description for the second card...", component: Textarea, rows: 3 },
  { name: "exploreCard3Title", label: "Card 3 Title", placeholder: "e.g., Warm Hospitality", component: Input },
  { name: "exploreCard3Description", label: "Card 3 Description", placeholder: "Description for the third card...", component: Textarea, rows: 3 },
  { sectionTitle: "Booking Call to Action", name: "bookingCallToActionParagraph", label: "Call to Action Paragraph (above button)", placeholder: "e.g., Ready to experience the charm...?", component: Textarea, rows: 2 },
];

export function EditableWelcomePageTextContent() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | string | null>(null);

  const form = useForm<WelcomePageTextContentFormValues>({
    resolver: zodResolver(welcomePageTextContentSchema),
    defaultValues: async () => {
      setIsLoading(true);
      try {
        const content = await getWelcomePageTextContent();
        if (content.updatedAt && content.updatedAt instanceof Date && !isNaN(content.updatedAt.getTime())) {
            setLastUpdated(content.updatedAt);
        } else {
             setLastUpdated("Not yet saved with timestamp.");
        }
        const { updatedAt, ...formData } = content;
        return formData;
      } catch (error) {
        console.error("Failed to load welcome page text content:", error);
        toast({
          title: "Error Loading Content",
          description: "Could not load page content. Please try refreshing.",
          variant: "destructive",
        });
        setLastUpdated(null);
        return formFieldsConfig.reduce((acc, field) => ({ ...acc, [field.name]: "" }), {} as WelcomePageTextContentFormValues);
      } finally {
        setIsLoading(false);
      }
    },
  });

  const onSubmit = async (data: WelcomePageTextContentFormValues) => {
    setIsSaving(true);
    try {
      const result = await updateWelcomePageTextContent(data);
      if (result.success) {
        toast({ title: "Success!", description: result.message });
        const updatedContent = await getWelcomePageTextContent();
        if (updatedContent.updatedAt && updatedContent.updatedAt instanceof Date) {
          setLastUpdated(updatedContent.updatedAt);
        }
        const { updatedAt, ...formData } = updatedContent;
        form.reset(formData);
      } else {
        toast({ title: "Save Failed", description: result.message, variant: "destructive" });
      }
    } catch (error) {
      console.error("Error saving content:", error);
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading && !form.formState.isDirty) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 font-body text-muted-foreground">Loading content editor...</p>
      </div>
    );
  }

  let currentSectionTitle: string | undefined = undefined;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline">Edit Welcome Page Text Fields</CardTitle>
        {lastUpdated && (
          <CardDescription className="font-body text-xs text-muted-foreground">
            Last saved: {lastUpdated instanceof Date ? format(lastUpdated, "PPP p") : lastUpdated}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {formFieldsConfig.map(({ name, label, placeholder, component: FieldComponent, rows, sectionTitle }, index) => {
              const sectionHeader = sectionTitle && sectionTitle !== currentSectionTitle ? (
                <CardTitle className="font-headline text-xl pt-6 pb-2 border-t mt-4 first:mt-0 first:border-t-0">{sectionTitle}</CardTitle>
              ) : null;
              if (sectionTitle) currentSectionTitle = sectionTitle;

              return (
                <React.Fragment key={name}>
                  {sectionHeader}
                  <FormField
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </React.Fragment>
              );
            })}
            
            <Button type="submit" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground mt-8" disabled={isSaving || (isLoading && !form.formState.isDirty)}>
              {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
              Save Welcome Page Text
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
