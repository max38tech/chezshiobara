
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState } from "react";
import { Button } from '@/components/ui/button';
import { PageContentWrapper } from '@/components/layout/page-content-wrapper';
import { PageTitle } from '@/components/ui/page-title';
import { SectionTitle } from '@/components/ui/section-title';
import { Card, CardContent, CardHeader, CardTitle as SectionCardTitle } from '@/components/ui/card'; // Renamed CardTitle to avoid conflict
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowRight } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function WelcomePage() {
  const images = [
    { src: "https://placehold.co/600x400.png", alt: "Beautiful B&B exterior", hint: "house exterior" },
    { src: "https://placehold.co/600x400.png", alt: "Cozy room interior", hint: "bedroom interior" },
    { src: "https://placehold.co/600x400.png", alt: "Scenic local view", hint: "nature landscape" },
    { src: "https://placehold.co/600x400.png", alt: "Delicious breakfast", hint: "breakfast food" },
    { src: "https://placehold.co/600x400.png", alt: "Garden area", hint: "garden flowers" },
    { src: "https://placehold.co/600x400.png", alt: "Nearby attraction", hint: "local landmark" },
  ];

  const [selectedImage, setSelectedImage] = useState<typeof images[0] | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleImageClick = (image: typeof images[0]) => {
    setSelectedImage(image);
    setIsDialogOpen(true);
  };

  return (
    <PageContentWrapper>
      <PageTitle>Welcome to Chez Shiobara B&amp;B</PageTitle>
      
      <section className="text-center mb-12">
        <p className="font-body text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Discover a hidden gem nestled in Yokohama, perfectly positioned for exploring the greater Tokyo area. Experience unparalleled comfort, 
          charming hospitality, and unforgettable moments. Your perfect getaway starts here.
        </p>
      </section>

      <section className="mb-16">
        <Carousel
          opts={{
            align: "start",
            loop: images.length > 3, // Loop if more than 3 images (typical for lg view)
          }}
          className="w-full max-w-3xl mx-auto"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {images.map((image, index) => (
              <CarouselItem key={index} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3">
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
                    data-ai-hint={image.hint}
                    priority={index < 3} // Prioritize first few thumbnails
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="ml-[-12px] sm:ml-0" />
          <CarouselNext className="mr-[-12px] sm:mr-0" />
        </Carousel>
      </section>

      {selectedImage && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="w-full max-w-[95vw] sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-5xl p-2 sm:p-4">
            <DialogHeader className="sr-only">
              <DialogTitle>{selectedImage.alt}</DialogTitle>
            </DialogHeader>
            <div className="relative w-full aspect-video">
              <Image
                src={selectedImage.src}
                alt="" // Alt is in DialogTitle for SR; image is decorative here
                fill
                className="object-contain rounded-md"
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 80vw, (max-width: 1280px) 70vw, 65vw"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      <section className="mb-16 text-center">
        <SectionTitle>Explore Our B&amp;B</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <SectionCardTitle className="font-headline text-2xl">Comfortable Guest Room</SectionCardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-body text-muted-foreground">
                Unwind in our thoughtfully designed guest room, a sanctuary of peace offering modern comforts and a touch of local charm, ensuring a restful and rejuvenating stay.
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <SectionCardTitle className="font-headline text-2xl">Explore the Region</SectionCardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-body text-muted-foreground">
                Discover the vibrant culture and attractions of the greater Tokyo area. We'll share our favorite spots, from bustling cityscapes in Tokyo and historic temples in Kamakura to scenic local trails and authentic dining, helping you craft unforgettable memories.
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <SectionCardTitle className="font-headline text-2xl">Warm Hospitality</SectionCardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-body text-muted-foreground">
                As your hosts, Shino and Shawn are dedicated to making your visit special. We invite you to treat our home as your own – feel free to use the kitchen, store groceries in the fridge, relax with TV in the living room, or use the dining table as a workspace. Expect a personal touch, helpful advice, and a genuinely warm welcome.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
      
      <section className="text-center">
        <p className="font-body text-lg md:text-xl text-muted-foreground mb-6">
          Ready to experience the charm of Chez Shiobara?
        </p>
        <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href="/booking">
            Book Your Stay <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </section>
    </PageContentWrapper>
  );
}
