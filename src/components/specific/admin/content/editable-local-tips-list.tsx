
"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { getLocalTipsPageContent, updateLocalTipsPageContent, type LocalTipItem } from "@/actions/content";
import { localTipsPageContentFormSchema, type LocalTipsPageContentFormValues } from "@/schemas/content";
import { Loader2, PlusCircle, Trash2, Save, Image as ImageIcon } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import NextImage from "next/image";

const CATEGORY_SUGGESTIONS = ["Dining", "Sightseeing", "Activities", "Hidden Gem", "Shopping", "Nature"];

export function EditableLocalTipsList() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<LocalTipsPageContentFormValues>({
    resolver: zodResolver(localTipsPageContentFormSchema),
    defaultValues: {
      localTips: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "localTips",
    keyName: "fieldId",
  });

  useEffect(() => {
    async function loadLocalTips() {
      setIsLoading(true);
      try {
        const content = await getLocalTipsPageContent();
        if (content && content.localTips) {
          const itemsWithEnsuredIds = content.localTips.map(item => ({
            ...item,
            id: item.id || uuidv4(),
            imageUrl: item.imageUrl || "", // Ensure imageUrl is a string
            dataAiHint: item.dataAiHint || "", // Ensure dataAiHint is a string
          }));
          form.reset({ localTips: itemsWithEnsuredIds });
        }
      } catch (error) {
        console.error("Failed to load local tips:", error);
        toast({
          title: "Error",
          description: "Failed to load local tips. Please try refreshing.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadLocalTips();
  }, [form, toast]);

  const onSubmit = async (data: LocalTipsPageContentFormValues) => {
    setIsSaving(true);
    try {
      const itemsToSave = data.localTips.map(item => ({
        ...item,
        id: item.id || uuidv4(),
        imageUrl: item.imageUrl === "" ? undefined : item.imageUrl, // Store as undefined if empty
        dataAiHint: item.dataAiHint === "" ? undefined : item.dataAiHint, // Store as undefined if empty
      }));

      const result = await updateLocalTipsPageContent(itemsToSave);
      if (result.success) {
        toast({
          title: "Success!",
          description: result.message,
        });
        // Reset form with potentially updated/cleaned data (e.g. undefined for empty optional fields)
        form.reset({ localTips: itemsToSave.map(item => ({...item, imageUrl: item.imageUrl || "", dataAiHint: item.dataAiHint || ""})) });
      } else {
        toast({
          title: "Save Failed",
          description: result.message || "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving local tips:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while saving. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addNewLocalTip = () => {
    append({
      id: uuidv4(),
      title: "",
      description: "",
      category: "Dining", // Default category
      imageUrl: "",
      dataAiHint: "",
    });
  };
  
  const currentTips = form.watch("localTips");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 font-body text-muted-foreground">Loading local tips editor...</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields.map((field, index) => {
            const imageUrl = currentTips?.[index]?.imageUrl;
            const isValidHttpUrl = typeof imageUrl === 'string' && imageUrl.startsWith('https://');

            return (
              <Card key={field.fieldId} className="shadow-md relative flex flex-col">
                <CardHeader className="flex-shrink-0">
                  <CardTitle className="font-headline text-lg flex items-center justify-between">
                    <span>Tip #{index + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive/80"
                      onClick={() => remove(index)}
                      aria-label="Remove local tip"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 flex-grow flex flex-col">
                  <FormField
                    control={form.control}
                    name={`localTips.${index}.title`}
                    render={({ field: controllerField }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Name of Place or Tip Title" {...controllerField} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`localTips.${index}.description`}
                    render={({ field: controllerField }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe the tip or place..." rows={3} {...controllerField} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`localTips.${index}.category`}
                    render={({ field: controllerField }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input list="category-suggestions" placeholder="e.g., Dining, Sightseeing" {...controllerField} />
                        </FormControl>
                        <datalist id="category-suggestions">
                          {CATEGORY_SUGGESTIONS.map(cat => <option key={cat} value={cat} />)}
                        </datalist>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="aspect-video w-full bg-muted rounded-md overflow-hidden my-2 flex items-center justify-center">
                    {isValidHttpUrl ? (
                        <NextImage
                          src={imageUrl}
                          alt={currentTips?.[index]?.title || `Preview for tip ${index + 1}`}
                          width={300}
                          height={200}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <ImageIcon className="h-10 w-10 mb-1" />
                          <p className="text-xs">No image or invalid URL</p>
                        </div>
                      )}
                  </div>

                  <FormField
                    control={form.control}
                    name={`localTips.${index}.imageUrl`}
                    render={({ field: controllerField }) => (
                      <FormItem>
                        <FormLabel>Image URL (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/image.png" {...controllerField} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`localTips.${index}.dataAiHint`}
                    render={({ field: controllerField }) => (
                      <FormItem>
                        <FormLabel>AI Hint for Image (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 'restaurant interior'" {...controllerField} />
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
          <Button type="button" variant="outline" onClick={addNewLocalTip} className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Tip
          </Button>
          <Button type="submit" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSaving || isLoading}>
            {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
            Save Local Tips
          </Button>
        </div>
      </form>
    </Form>
  );
}
