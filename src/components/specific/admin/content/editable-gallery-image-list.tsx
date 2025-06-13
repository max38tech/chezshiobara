
"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { getWelcomePageGalleryContent, updateWelcomePageGalleryContent } from "@/actions/content";
import { welcomePageGalleryContentFormSchema, type WelcomePageGalleryContentFormValues } from "@/schemas/content";
import { Loader2, PlusCircle, Trash2, Save, UploadCloud } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import NextImage from "next/image";
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { app } from "@/lib/firebase"; 
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const storage = getStorage(app);

interface UploadProgress {
  [itemId: string]: number | null;
}

export function EditableGalleryImageList() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [itemToDelete, setItemToDelete] = useState<{ index: number; src?: string } | null>(null);

  const form = useForm<WelcomePageGalleryContentFormValues>({
    resolver: zodResolver(welcomePageGalleryContentFormSchema),
    defaultValues: {
      galleryImages: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
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

  const handleFileUpload = async (file: File, index: number, itemId: string) => {
    if (!file) return;

    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const imageRef = storageRef(storage, `gallery_images/${fileName}`);

    setUploadProgress(prev => ({ ...prev, [itemId]: 0 }));

    const uploadTask = uploadBytesResumable(imageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(prev => ({ ...prev, [itemId]: progress }));
      },
      (error) => {
        console.error("Upload failed:", error);
        toast({
          title: "Upload Failed",
          description: `Could not upload ${file.name}. Error: ${error.message}`,
          variant: "destructive",
        });
        setUploadProgress(prev => ({ ...prev, [itemId]: null }));
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          form.setValue(`galleryImages.${index}.src`, downloadURL, { shouldDirty: true });
          toast({
            title: "Upload Successful",
            description: `${file.name} uploaded and link updated.`,
          });
        } catch (error) {
            console.error("Failed to get download URL:", error);
             toast({
                title: "Error",
                description: "Image uploaded, but failed to get its URL.",
                variant: "destructive",
            });
        } finally {
            setUploadProgress(prev => ({ ...prev, [itemId]: null }));
        }
      }
    );
  };

  const confirmDeleteImage = async () => {
    if (!itemToDelete) return;
    const { index, src } = itemToDelete;

    if (src && src.includes("firebasestorage.googleapis.com")) {
      try {
        const imageRef = storageRef(storage, src);
        await deleteObject(imageRef);
        toast({
          title: "Image Deleted",
          description: "Image successfully deleted from Firebase Storage.",
        });
      } catch (error: any) {
        // If deletion fails (e.g., file not found, permissions), still allow removal from list
        console.error("Failed to delete image from Firebase Storage:", error);
        if (error.code !== 'storage/object-not-found') {
          toast({
            title: "Storage Deletion Failed",
            description: `Could not delete image from storage: ${error.message}. It will still be removed from the gallery list.`,
            variant: "destructive",
          });
        }
      }
    }
    remove(index);
    setItemToDelete(null); // Close dialog
  };


  const onSubmit = async (data: WelcomePageGalleryContentFormValues) => {
    setIsSaving(true);
    try {
      const itemsToSave = data.galleryImages.map(item => ({
        ...item,
        id: item.id || uuidv4(),
      }));

      const result = await updateWelcomePageGalleryContent(itemsToSave);
      if (result.success) {
        toast({
          title: "Success!",
          description: result.message,
        });
        form.reset({ galleryImages: itemsToSave }, { keepValues: false, keepDirty: false, keepDefaultValues: false });
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
      src: "", 
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
    <>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fields.map((fieldItem, index) => {
            const currentItem = currentImages?.[index];
            const imageUrl = currentItem?.src;
            const isValidHttpUrl = typeof imageUrl === 'string' && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'));
            const itemUploadProgress = uploadProgress[fieldItem.id];

            return (
              <Card key={fieldItem.fieldId} className="shadow-md relative flex flex-col">
                <CardHeader className="flex-shrink-0">
                  <CardTitle className="font-headline text-lg flex items-center justify-between">
                    <span>Image #{index + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive/80"
                      onClick={() => setItemToDelete({ index, src: currentItem?.src })}
                      aria-label="Remove gallery image"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 flex-grow flex flex-col">
                  <div className="aspect-video w-full bg-muted rounded-md overflow-hidden mb-2 flex items-center justify-center">
                    {isValidHttpUrl ? (
                        <NextImage
                          src={imageUrl}
                          alt={currentItem?.alt || `Preview for image ${index + 1}`}
                          width={300}
                          height={200}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground p-4">
                          <UploadCloud className="h-12 w-12 mb-2" />
                          <p className="text-sm text-center">Upload an image</p>
                        </div>
                      )}
                  </div>
                  
                  <FormItem>
                    <FormLabel htmlFor={`galleryImages.${index}.file`}>Upload/Replace Image</FormLabel>
                    <FormControl>
                      <Input
                        id={`galleryImages.${index}.file`}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileUpload(e.target.files[0], index, fieldItem.id);
                          }
                        }}
                        className="text-sm"
                        disabled={itemUploadProgress !== null && itemUploadProgress !== undefined}
                      />
                    </FormControl>
                     {itemUploadProgress !== null && itemUploadProgress !== undefined && (
                        <Progress value={itemUploadProgress} className="w-full h-2 mt-1" />
                      )}
                    <FormMessage />
                  </FormItem>

                  <FormField
                    control={form.control}
                    name={`galleryImages.${index}.src`}
                    render={({ field: controllerField }) => (
                      <FormItem className="hidden">
                        <FormControl>
                          <Input {...controllerField} readOnly />
                        </FormControl>
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
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Image Item
          </Button>
          <Button type="submit" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSaving || isLoading || Object.values(uploadProgress).some(p => p !== null)}>
            {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
            Save Gallery Changes
          </Button>
        </div>
         {Object.values(uploadProgress).some(p => p !== null) && (
            <p className="text-sm text-muted-foreground text-center">Please wait for all uploads to complete before saving.</p>
        )}
      </form>
    </Form>

    {itemToDelete !== null && (
        <AlertDialog open={itemToDelete !== null} onOpenChange={(open) => !open && setItemToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This will remove the image from the gallery list. If it's an uploaded image, it will also be deleted from Firebase Storage. This action cannot be undone.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDeleteImage} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                    Delete Image
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )}
    </>
  );
}
