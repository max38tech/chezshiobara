
"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  getWhoWeArePageContent, 
  updateWhoWeArePageContent,
  type WhoWeArePageContent
} from "@/actions/content";
import { 
  whoWeArePageContentSchema, 
  type WhoWeArePageContentFormValues 
} from "@/schemas/content";
import { Loader2, PlusCircle, Trash2, Save, UploadCloud } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import NextImage from "next/image";
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { app } from "@/lib/firebase"; 
import { format } from 'date-fns';

const storage = getStorage(app);

export function EditableWhoWeAreContent() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | string | null>(null);

  const form = useForm<WhoWeArePageContentFormValues>({
    resolver: zodResolver(whoWeArePageContentSchema),
    defaultValues: async () => {
      setIsLoading(true);
      try {
        const content = await getWhoWeArePageContent();
        if (content.updatedAt && content.updatedAt instanceof Date && !isNaN(content.updatedAt.getTime())) {
            setLastUpdated(content.updatedAt);
        } else {
             setLastUpdated("Not yet saved with timestamp.");
        }
        const { updatedAt, ...formData } = content; // Exclude updatedAt for form
        return formData;
      } catch (error) {
        console.error("Failed to load 'Who We Are' content:", error);
        toast({
          title: "Error Loading Content",
          description: "Could not load page content. Please try refreshing.",
          variant: "destructive",
        });
        setLastUpdated(null);
        // Return empty structure based on schema if loading fails
        return {
          pageTitle: "",
          heroImage: { src: "", alt: "", dataAiHint: "" },
          ourStorySection: { title: "", paragraphs: [{id: uuidv4(), text: ""}] },
          ourPhilosophySection: { title: "", introParagraph: "", philosophyItems: [{id: uuidv4(), title: "", description: ""}] },
        };
      } finally {
        setIsLoading(false);
      }
    },
  });

  const { fields: storyParagraphs, append: appendStoryParagraph, remove: removeStoryParagraph } = useFieldArray({
    control: form.control,
    name: "ourStorySection.paragraphs",
    keyName: "fieldId",
  });

  const { fields: philosophyItems, append: appendPhilosophyItem, remove: removePhilosophyItem } = useFieldArray({
    control: form.control,
    name: "ourPhilosophySection.philosophyItems",
    keyName: "fieldId",
  });

  const handleHeroImageUpload = async (file: File) => {
    if (!file) return;

    const currentImageSrc = form.getValues("heroImage.src");
    if (currentImageSrc && currentImageSrc.includes("firebasestorage.googleapis.com")) {
      try {
        const oldImageRef = storageRef(storage, currentImageSrc);
        await deleteObject(oldImageRef);
        toast({ title: "Old Image Removed", description: "Previous hero image deleted from storage."});
      } catch (error: any) {
        if (error.code !== 'storage/object-not-found') {
          console.warn("Could not delete old hero image from storage:", error);
        }
      }
    }

    const fileExtension = file.name.split('.').pop();
    const fileName = `who_we_are_hero/${uuidv4()}.${fileExtension}`;
    const imageRef = storageRef(storage, fileName);

    setUploadProgress(0);
    const uploadTask = uploadBytesResumable(imageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload failed:", error);
        toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
        setUploadProgress(null);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        form.setValue("heroImage.src", downloadURL, { shouldDirty: true });
        toast({ title: "Upload Successful", description: "Hero image updated." });
        setUploadProgress(null);
      }
    );
  };

  const onSubmit = async (data: WhoWeArePageContentFormValues) => {
    setIsSaving(true);
    try {
      const result = await updateWhoWeArePageContent(data);
      if (result.success) {
        toast({ title: "Success!", description: result.message });
        const updatedContent = await getWhoWeArePageContent();
        if (updatedContent.updatedAt && updatedContent.updatedAt instanceof Date) {
          setLastUpdated(updatedContent.updatedAt);
        }
        form.reset(updatedContent); // Reset with new data including potentially new IDs
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
  
  const heroImageSrc = form.watch("heroImage.src");
  const isValidHeroUrl = typeof heroImageSrc === 'string' && (heroImageSrc.startsWith('http://') || heroImageSrc.startsWith('https://'));


  if (isLoading && !form.formState.isDirty) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 font-body text-muted-foreground">Loading content editor...</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Page Header</CardTitle>
             {lastUpdated && (
              <CardDescription className="font-body text-xs text-muted-foreground">
                Last saved: {lastUpdated instanceof Date ? format(lastUpdated, "PPP p") : lastUpdated}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="pageTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Page Title</FormLabel>
                  <FormControl><Input placeholder="e.g., Meet Your Hosts" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <CardTitle className="font-headline text-lg pt-2">Hero Image</CardTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <div className="space-y-4">
                 <FormItem>
                    <FormLabel htmlFor="heroImageFile">Upload/Replace Hero Image</FormLabel>
                    <FormControl>
                      <Input
                        id="heroImageFile"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleHeroImageUpload(e.target.files[0]);
                          }
                        }}
                        className="text-sm"
                        disabled={uploadProgress !== null}
                      />
                    </FormControl>
                     {uploadProgress !== null && (
                        <Progress value={uploadProgress} className="w-full h-2 mt-1" />
                      )}
                    <FormMessage />
                  </FormItem>
                <FormField
                  control={form.control}
                  name="heroImage.alt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hero Image Alt Text</FormLabel>
                      <FormControl><Input placeholder="Descriptive alt text for hero image" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="heroImage.dataAiHint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hero Image AI Hint</FormLabel>
                      <FormControl><Input placeholder="e.g., 'friendly couple portrait'" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="aspect-[4/5] w-full max-w-sm mx-auto bg-muted rounded-md overflow-hidden flex items-center justify-center">
                {isValidHeroUrl ? (
                    <NextImage
                      src={heroImageSrc}
                      alt={form.watch("heroImage.alt") || "Hero image preview"}
                      width={400}
                      height={500}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="text-muted-foreground text-center p-4">
                      <UploadCloud className="h-16 w-16 mx-auto mb-2" />
                      <p>Upload an image</p>
                    </div>
                  )}
              </div>
            </div>
             <FormField
                control={form.control}
                name="heroImage.src" 
                render={({ field }) => (<FormItem className="hidden"><FormControl><Input {...field} readOnly /></FormControl></FormItem>)}
             />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Our Story Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="ourStorySection.title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Section Title</FormLabel>
                  <FormControl><Input placeholder="e.g., Our Journey" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <FormLabel>Story Paragraphs</FormLabel>
              <div className="space-y-4 mt-2">
                {storyParagraphs.map((field, index) => (
                  <Card key={field.fieldId} className="p-4 bg-muted/30">
                    <FormField
                      control={form.control}
                      name={`ourStorySection.paragraphs.${index}.text`}
                      render={({ field: controllerField }) => (
                        <FormItem>
                          <FormLabel className="sr-only">Paragraph {index + 1}</FormLabel>
                          <FormControl><Textarea placeholder={`Paragraph ${index + 1}`} rows={4} {...controllerField} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeStoryParagraph(index)} className="mt-2 text-destructive hover:text-destructive/80">
                      <Trash2 className="mr-1 h-4 w-4" /> Remove Paragraph
                    </Button>
                  </Card>
                ))}
                <Button type="button" variant="outline" onClick={() => appendStoryParagraph({ id: uuidv4(), text: "" })}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Story Paragraph
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Our Philosophy Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="ourPhilosophySection.title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Section Title</FormLabel>
                  <FormControl><Input placeholder="e.g., What We Believe In" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ourPhilosophySection.introParagraph"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Introductory Text</FormLabel>
                  <FormControl><Textarea placeholder="e.g., At our B&B, we value..." rows={3} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <FormLabel>Philosophy Points</FormLabel>
              <div className="space-y-4 mt-2">
                {philosophyItems.map((field, index) => (
                  <Card key={field.fieldId} className="p-4 bg-muted/30">
                    <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name={`ourPhilosophySection.philosophyItems.${index}.title`}
                      render={({ field: controllerField }) => (
                        <FormItem>
                          <FormLabel>Point Title</FormLabel>
                          <FormControl><Input placeholder="e.g., Genuine Hospitality" {...controllerField} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`ourPhilosophySection.philosophyItems.${index}.description`}
                      render={({ field: controllerField }) => (
                        <FormItem>
                          <FormLabel>Point Description</FormLabel>
                          <FormControl><Textarea placeholder="Describe this philosophy point..." rows={2} {...controllerField} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removePhilosophyItem(index)} className="mt-2 text-destructive hover:text-destructive/80">
                      <Trash2 className="mr-1 h-4 w-4" /> Remove Point
                    </Button>
                  </Card>
                ))}
                <Button type="button" variant="outline" onClick={() => appendPhilosophyItem({ id: uuidv4(), title: "", description: "" })}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Philosophy Point
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSaving || isLoading || uploadProgress !== null}>
          {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
          Save &quot;Who We Are&quot; Content
        </Button>
         {uploadProgress !== null && (
            <p className="text-sm text-muted-foreground text-center">Please wait for image upload to complete before saving.</p>
        )}
      </form>
    </Form>
  );
}
