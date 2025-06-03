
"use client";

import Image from 'next/image';
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { GalleryImageItem } from '@/actions/content';

interface WelcomePageGalleryProps {
  images: GalleryImageItem[];
}

export function WelcomePageGallery({ images }: WelcomePageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<GalleryImageItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleImageClick = (image: GalleryImageItem) => {
    setSelectedImage(image);
    setIsDialogOpen(true);
  };

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
          loop: images.length > 3, 
        }}
        className="w-full max-w-3xl mx-auto"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {images.map((image, index) => (
            <CarouselItem key={image.id || `gallery-img-${index}`} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3">
              <div
                className="aspect-[3/2] overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group bg-muted"
                onClick={() => handleImageClick(image)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleImageClick(image); }}
                tabIndex={0}
                role="button"
                aria-label={`View image ${index + 1}: ${image.alt}`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={300}
                  height={200}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint={image.dataAiHint}
                  priority={index < 3} 
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="ml-[-12px] sm:ml-0" />
        <CarouselNext className="mr-[-12px] sm:mr-0" />
      </Carousel>

      {selectedImage && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="w-full max-w-[95vw] sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-5xl p-2 sm:p-4">
            <DialogHeader className="sr-only">
              <DialogTitle>{selectedImage.alt}</DialogTitle>
            </DialogHeader>
            <div className="relative w-full aspect-video">
              <Image
                src={selectedImage.src}
                alt="" 
                fill
                className="object-contain rounded-md"
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 80vw, (max-width: 1280px) 70vw, 65vw"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
