
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageContentWrapper } from '@/components/layout/page-content-wrapper';
import { PageTitle } from '@/components/ui/page-title';
import { SectionTitle } from '@/components/ui/section-title';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  ];

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
            loop: true,
          }}
          className="w-full max-w-3xl mx-auto"
        >
          <CarouselContent>
            {images.map((image, index) => (
              <CarouselItem key={index} className="md:basis-1/1 lg:basis-1/1"> {/* Adjust basis for number of items visible */}
                <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover aspect-[3/2]"
                    data-ai-hint={image.hint}
                    priority={index === 0}
                  />
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </section>

      <section className="mb-16 text-center">
        <SectionTitle>Explore Our B&amp;B</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Comfortable Guest Room</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-body text-muted-foreground">
                Unwind in our thoughtfully designed guest room, a sanctuary of peace offering modern comforts and a touch of local charm, ensuring a restful and rejuvenating stay.
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Explore the Region</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-body text-muted-foreground">
                Discover the vibrant culture and attractions of the greater Tokyo area. We'll share our favorite spots, from bustling cityscapes in Tokyo and historic temples in Kamakura to scenic local trails and authentic dining, helping you craft unforgettable memories.
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Warm Hospitality</CardTitle>
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
