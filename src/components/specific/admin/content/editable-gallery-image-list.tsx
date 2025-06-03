
"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { getWelcomePageGalleryContent, updateWelcomePageGalleryContent, type GalleryImageItem } from "@/actions/content";
import { welcomePageGalleryContentFormSchema, type WelcomePageGalleryContentFormValues } from "@/schemas/content";
import { Loader2, PlusCircle, Trash2, Save, Image as ImageIcon } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import NextImage from "next/image"; // Use NextImage for preview

export function EditableGalleryImageList() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<WelcomePageGalleryContentFormValues>({
    resolver: zodResolver(welcomePageGalleryContentFormSchema),
    defaultValues: {
      galleryImages: [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "galleryImages",
    keyName: "fieldId",
  });

  useEffect(() => {
    async function loadGalleryImages() {
      setIsLoading(true);
      try {
        const content = await getWelcomePageGalleryContent();
        if (content && content.galleryImages) {
          const itemsWithEnsuredIds = content.galleryImages.map(item => ({
            ...item,
            id: item.id || uuidv4(),
          }));
          form.reset({ galleryImages: itemsWithEnsuredIds });
        }
      } catch (error) {
        console.error("Failed to load gallery images:", error);
        toast({
          title: "Error",
          description: "Failed to load gallery images. Please try refreshing.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadGalleryImages();
  }, [form, toast]);

  const onSubmit = async (data: WelcomePageGalleryContentFormValues) => {
    setIsSaving(true);
    try {
      const itemsToSave = data.galleryImages.map(item => ({
        ...item,
        id: item.id || uuidv4(), // Ensure ID exists
      }));

      const result = await updateWelcomePageGalleryContent(itemsToSave);
      if (result.success) {
        toast({
          title: "Success!",
          description: result.message,
        });
        form.reset({ galleryImages: itemsToSave }); // Reflect saved state including any new IDs
      } else {
        toast({
          title: "Save Failed",
          description: result.message || "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving gallery images:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while saving. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addNewGalleryItem = () => {
    append({
      id: uuidv4(),
      src: "https://placehold.co/600x400.png", // Default placeholder
      alt: "New gallery image",
      dataAiHint: "image",
    });
  };
  
  const currentImages = form.watch("galleryImages");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 font-body text-muted-foreground">Loading gallery editor...</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fields.map((field, index) => {
            const imageUrl = currentImages?.[index]?.src;
            const isValidHttpUrl = typeof imageUrl === 'string' && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'));

            return (
              <Card key={field.fieldId} className="shadow-md relative flex flex-col">
                <CardHeader className="flex-shrink-0">
                  <CardTitle className="font-headline text-lg flex items-center justify-between">
                    <span>Image #{index + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive/80"
                      onClick={() => remove(index)}
                      aria-label="Remove gallery image"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 flex-grow flex flex-col">
                  <div className="aspect-video w-full bg-muted rounded-md overflow-hidden mb-4 flex items-center justify-center">
                    {isValidHttpUrl ? (
                        <NextImage
                          src={imageUrl}
                          alt={currentImages?.[index]?.alt || `Preview for image ${index + 1}`}
                          width={300}
                          height={200}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            // e.currentTarget.src = "https://placehold.co/300x200.png?text=Invalid+URL"; 
                            // Potentially update form value or show error
                            // For now, let CSS handle background if image fails
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <ImageIcon className="h-12 w-12 mb-2" />
                          <p className="text-sm">Preview N/A</p>
                          <p className="text-xs">(Enter a valid URL)</p>
                        </div>
                      )}
                  </div>
                  <FormField
                    control={form.control}
                    name={`galleryImages.${index}.src`}
                    render={({ field: controllerField }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://example.com/image.png" {...controllerField} 
                            onChange={(e) => {
                              controllerField.onChange(e);
                              // Optionally force re-render or update a preview state if needed
                              // For simple URL changes, form.watch should trigger preview update
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`galleryImages.${index}.alt`}
                    render={({ field: controllerField }) => (
                      <FormItem>
                        <FormLabel>Alt Text</FormLabel>
                        <FormControl>
                          <Input placeholder="Descriptive alt text" {...controllerField} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`galleryImages.${index}.dataAiHint`}
                    render={({ field: controllerField }) => (
                      <FormItem>
                        <FormLabel>AI Hint</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 'house exterior'" {...controllerField} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button type="button" variant="outline" onClick={addNewGalleryItem} className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Image
          </Button>
          <Button type="submit" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSaving || isLoading}>
            {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
            Save Gallery Changes
          </Button>
        </div>
      </form>
    </Form>
  );
}
