
"use client";

import Image from 'next/image';
import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import type { GalleryImageItem } from '@/actions/content';

interface WelcomePageGalleryProps {
  images: GalleryImageItem[];
}

export function WelcomePageGallery({ images }: WelcomePageGalleryProps) {
  const [selectedImageForTitle, setSelectedImageForTitle] = useState<GalleryImageItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [startIndexForDialog, setStartIndexForDialog] = useState(0);
  const [dialogCarouselApi, setDialogCarouselApi] = useState<CarouselApi>();
  const [currentDialogAltText, setCurrentDialogAltText] = useState<string>("");

  const handleImageClick = useCallback((image: GalleryImageItem, index: number) => {
    setSelectedImageForTitle(image); 
    setCurrentDialogAltText(image.alt); 
    setStartIndexForDialog(index);
    setIsDialogOpen(true);
  }, []);

  useEffect(() => {
    if (!dialogCarouselApi) {
      return;
    }

    const onSelect = () => {
      const selectedIndex = dialogCarouselApi.selectedScrollSnap();
      setCurrentDialogAltText(images[selectedIndex]?.alt || "");
    };

    // Set initial alt text
    const initialSelectedIndex = dialogCarouselApi.selectedScrollSnap();
     if (images[initialSelectedIndex]) {
        setCurrentDialogAltText(images[initialSelectedIndex].alt);
     } else if (images.length > 0 && images[startIndexForDialog]) {
        setCurrentDialogAltText(images[startIndexForDialog].alt);
    }

    dialogCarouselApi.on("select", onSelect);

    return () => {
      dialogCarouselApi?.off("select", onSelect);
    };
  }, [dialogCarouselApi, images, startIndexForDialog]);


  if (!images || images.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground font-body">
        <p>Gallery images are currently being curated. Please check back soon!</p>
      </div>
    );
  }

  return (
    <>
      <Carousel
        opts={{
          align: "start",
          loop: images.length > 1, 
        }}
        className="w-full max-w-4xl mx-auto"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {images.map((image, index) => (
            <CarouselItem key={image.id || `gallery-img-${index}`} className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
              <div
                className="aspect-[3/2] overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group bg-muted"
                onClick={() => handleImageClick(image, index)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleImageClick(image, index); }}
                tabIndex={0}
                role="button"
                aria-label={`View image ${index + 1}: ${image.alt}`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={400} 
                  height={300} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint={image.dataAiHint}
                  priority={index < 4} 
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {images.length > 1 && (
          <>
            <CarouselPrevious className="absolute left-[-10px] top-1/2 -translate-y-1/2 z-10 sm:left-[-15px] text-foreground bg-background/50 hover:bg-background/75" />
            <CarouselNext className="absolute right-[-10px] top-1/2 -translate-y-1/2 z-10 sm:right-[-15px] text-foreground bg-background/50 hover:bg-background/75" />
          </>
        )}
      </Carousel>

      {isDialogOpen && selectedImageForTitle && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="w-full max-w-[95vw] sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl p-1 sm:p-2 md:p-4 bg-background/90 backdrop-blur-md">
            <DialogHeader className="sr-only">
              <DialogTitle>{selectedImageForTitle.alt}</DialogTitle>
            </DialogHeader>
            <div className="relative w-full pt-4 pb-8 md:pb-10">
              <Carousel
                setApi={setDialogCarouselApi}
                opts={{
                  align: "start",
                  loop: images.length > 1,
                  startIndex: startIndexForDialog,
                }}
                className="w-full"
              >
                <CarouselContent>
                  {images.map((image, index) => (
                    <CarouselItem 
                      key={`dialog-img-${image.id || index}`} 
                      className="relative h-[65vh] sm:h-[70vh] md:h-[75vh]" // CarouselItem now provides relative positioning and height
                    >
                      <Image
                        src={image.src}
                        alt={image.alt || `Gallery image ${index + 1}`}
                        fill 
                        className="object-contain rounded-md" 
                        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 80vw, 70vw"
                        priority // Prioritize loading images in the dialog
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {images.length > 1 && (
                   <>
                    <CarouselPrevious className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-20 text-white bg-black/40 hover:bg-black/60 border-none h-10 w-10 sm:h-12 sm:w-12 rounded-full" />
                    <CarouselNext className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-20 text-white bg-black/40 hover:bg-black/60 border-none h-10 w-10 sm:h-12 sm:w-12 rounded-full" />
                  </>
                )}
              </Carousel>
               {currentDialogAltText && (
                <p className="text-center text-sm text-muted-foreground font-body mt-3 px-4">
                    {currentDialogAltText}
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
