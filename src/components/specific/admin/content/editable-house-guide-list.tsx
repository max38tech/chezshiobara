
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
import { getHouseGuideContent, updateHouseGuideContent, type HouseGuideItem } from "@/actions/content";
import { houseGuidePageContentFormSchema, type HouseGuidePageContentFormValues } from "@/schemas/content";
import { Loader2, PlusCircle, Trash2, Save } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';

export function EditableHouseGuideList() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<HouseGuidePageContentFormValues>({
    resolver: zodResolver(houseGuidePageContentFormSchema),
    defaultValues: {
      guideItems: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "guideItems",
    keyName: "fieldId",
  });

  useEffect(() => {
    async function loadGuideItems() {
      setIsLoading(true);
      try {
        const content = await getHouseGuideContent();
        if (content && content.guideItems) {
          const itemsWithEnsuredIds = content.guideItems.map(item => ({
            ...item,
            id: item.id || uuidv4(),
          }));
          form.reset({ guideItems: itemsWithEnsuredIds });
        }
      } catch (error) {
        console.error("Failed to load house guide items:", error);
        toast({
          title: "Error",
          description: "Failed to load house guide items. Please try refreshing.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadGuideItems();
  }, [form, toast]);

  const onSubmit = async (data: HouseGuidePageContentFormValues) => {
    setIsSaving(true);
    try {
      const itemsToSave = data.guideItems.map(item => ({
        ...item,
        id: item.id || uuidv4(),
      }));

      const result = await updateHouseGuideContent(itemsToSave);
      if (result.success) {
        toast({
          title: "Success!",
          description: result.message,
        });
        form.reset({ guideItems: itemsToSave });
      } else {
        toast({
          title: "Save Failed",
          description: result.message || "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving house guide items:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while saving. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addNewGuideItem = () => {
    append({
      id: uuidv4(),
      icon: "Info", // Default icon
      title: "",
      content: "",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 font-body text-muted-foreground">Loading house guide editor...</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {fields.map((field, index) => (
          <Card key={field.fieldId} className="shadow-md relative">
            <CardHeader>
              <CardTitle className="font-headline">Guide Item #{index + 1}</CardTitle>
               <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 text-destructive hover:text-destructive/80"
                  onClick={() => remove(index)}
                  aria-label="Remove guide item"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name={`guideItems.${index}.icon`}
                render={({ field: controllerField }) => (
                  <FormItem>
                    <FormLabel>Icon Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Lucide Icon Name (e.g., Wifi)" {...controllerField} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`guideItems.${index}.title`}
                render={({ field: controllerField }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Guide item title" {...controllerField} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`guideItems.${index}.content`}
                render={({ field: controllerField }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Guide item content. Use newlines for paragraphs." rows={5} {...controllerField} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        ))}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button type="button" variant="outline" onClick={addNewGuideItem} className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Guide Item
          </Button>
          <Button type="submit" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
            Save All Changes
          </Button>
        </div>
      </form>
    </Form>
  );
}
