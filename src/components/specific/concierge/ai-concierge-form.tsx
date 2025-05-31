"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { conciergeRequestSchema, type ConciergeRequestFormValues } from "@/schemas/concierge";
import { generateLocalSuggestions, type GenerateLocalSuggestionsOutput } from "@/ai/flows/generate-local-suggestions";
import { Loader2, Sparkles } from "lucide-react";

export function AiConciergeForm() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [suggestions, setSuggestions] = useState<GenerateLocalSuggestionsOutput | null>(null);

  const form = useForm<ConciergeRequestFormValues>({
    resolver: zodResolver(conciergeRequestSchema),
    defaultValues: {
      interests: "",
      location: "Shiobara, Tochigi, Japan",
    },
  });

  const onSubmit = (values: ConciergeRequestFormValues) => {
    setSuggestions(null); // Clear previous suggestions
    startTransition(async () => {
      try {
        const result = await generateLocalSuggestions(values);
        setSuggestions(result);
      } catch (error) {
        console.error("AI Concierge Error:", error);
        toast({
          title: "Error",
          description: "Could not fetch suggestions. Please try again later.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Tell Us Your Interests
          </CardTitle>
          <CardDescription className="font-body">
            Let our AI Concierge help you discover the best local spots and activities based on what you love.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="interests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Interests</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., hiking, local cuisine, hot springs, history, art galleries..."
                        className="resize-none"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Shiobara area" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Get Suggestions
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isPending && (
        <Card>
          <CardContent className="pt-6 flex items-center justify-center space-x-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <p className="font-body">Fetching recommendations...</p>
          </CardContent>
        </Card>
      )}

      {suggestions && suggestions.suggestions && (
        <Card className="shadow-lg animate-in fade-in-0 duration-500">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Here are some suggestions for you:</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-body text-base text-foreground space-y-3 whitespace-pre-line leading-relaxed">
              {suggestions.suggestions}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
