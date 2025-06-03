
"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { getRulesPageContent, updateRulesPageContent, type RuleItem } from "@/actions/content";
import { rulesPageContentFormSchema, type RulesPageContentFormValues } from "@/schemas/content";
import { Loader2, PlusCircle, Trash2, Save } from "lucide-react";
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

export function EditableRulesList() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<RulesPageContentFormValues>({
    resolver: zodResolver(rulesPageContentFormSchema),
    defaultValues: {
      rulesList: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "rulesList",
    keyName: "fieldId", // Use 'fieldId' instead of default 'id' to avoid conflict with RuleItem.id
  });

  useEffect(() => {
    async function loadRules() {
      setIsLoading(true);
      try {
        const content = await getRulesPageContent();
        if (content && content.rulesList) {
          // Ensure all items have a unique ID for useFieldArray, even if it's just for the form session
          const rulesWithEnsuredIds = content.rulesList.map(rule => ({
            ...rule,
            id: rule.id || uuidv4(), // Ensure 'id' exists for our data structure
          }));
          form.reset({ rulesList: rulesWithEnsuredIds });
        }
      } catch (error) {
        console.error("Failed to load rules:", error);
        toast({
          title: "Error",
          description: "Failed to load house rules. Please try refreshing.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadRules();
  }, [form, toast]);

  const onSubmit = async (data: RulesPageContentFormValues) => {
    setIsSaving(true);
    try {
      // Ensure all rules have a persistent ID before saving
      const rulesToSave = data.rulesList.map(rule => ({
        ...rule,
        id: rule.id || uuidv4(), // Generate ID if it's somehow missing (e.g. for newly added not-yet-saved item)
      }));

      const result = await updateRulesPageContent(rulesToSave);
      if (result.success) {
        toast({
          title: "Success!",
          description: result.message,
        });
        // Optionally, re-fetch or update form state if needed, though setDoc usually means data is consistent
        // For safety, let's reset the form with the saved data to reflect any ID changes
        form.reset({ rulesList: rulesToSave });
      } else {
        toast({
          title: "Save Failed",
          description: result.message || "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving rules:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while saving. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addNewRule = () => {
    append({
      id: uuidv4(), // Generate a new unique ID for the rule
      icon: "AlertTriangle", // Default icon
      title: "",
      description: "",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 font-body text-muted-foreground">Loading rules editor...</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {fields.map((field, index) => (
          <Card key={field.fieldId} className="shadow-md relative">
            <CardHeader>
              <CardTitle className="font-headline">Rule #{index + 1}</CardTitle>
               <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 text-destructive hover:text-destructive/80"
                  onClick={() => remove(index)}
                  aria-label="Remove rule"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name={`rulesList.${index}.icon`}
                render={({ field: controllerField }) => (
                  <FormItem>
                    <FormLabel>Icon Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Lucide Icon Name (e.g., Clock)" {...controllerField} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`rulesList.${index}.title`}
                render={({ field: controllerField }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Rule title" {...controllerField} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`rulesList.${index}.description`}
                render={({ field: controllerField }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Rule description" rows={3} {...controllerField} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        ))}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button type="button" variant="outline" onClick={addNewRule} className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Rule
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
