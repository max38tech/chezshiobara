'use server';

/**
 * @fileOverview AI concierge flow that provides local suggestions based on user interests.
 *
 * - generateLocalSuggestions - A function that generates local suggestions.
 * - GenerateLocalSuggestionsInput - The input type for the generateLocalSuggestions function.
 * - GenerateLocalSuggestionsOutput - The return type for the generateLocalSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLocalSuggestionsInputSchema = z.object({
  interests: z
    .string()
    .describe('The interests of the user, used to tailor the suggestions.'),
  location: z
    .string()
    .describe('The location for which suggestions are being requested.'),
});
export type GenerateLocalSuggestionsInput = z.infer<
  typeof GenerateLocalSuggestionsInputSchema
>;

const GenerateLocalSuggestionsOutputSchema = z.object({
  suggestions: z
    .string()
    .describe('A list of suggestions for local attractions, restaurants, or activities.'),
});
export type GenerateLocalSuggestionsOutput = z.infer<
  typeof GenerateLocalSuggestionsOutputSchema
>;

export async function generateLocalSuggestions(
  input: GenerateLocalSuggestionsInput
): Promise<GenerateLocalSuggestionsOutput> {
  return generateLocalSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLocalSuggestionsPrompt',
  input: {schema: GenerateLocalSuggestionsInputSchema},
  output: {schema: GenerateLocalSuggestionsOutputSchema},
  prompt: `You are an AI concierge for the Chez Shiobara B&B. A user is looking for local suggestions.

The user is interested in: {{{interests}}}.

The location is: {{{location}}}.

Provide a list of suggestions for local attractions, restaurants, or activities that align with the user's interests. Focus on experiences unique to the local area.
`,
});

const generateLocalSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateLocalSuggestionsFlow',
    inputSchema: GenerateLocalSuggestionsInputSchema,
    outputSchema: GenerateLocalSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
