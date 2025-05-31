import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageContentWrapper } from '@/components/layout/page-content-wrapper';
import { PageTitle } from '@/components/ui/page-title';
import { SectionTitle } from '@/components/ui/section-title';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

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
          Discover a hidden gem nestled in the heart of scenic Shiobara. Experience unparalleled comfort, 
          charming hospitality, and unforgettable moments. Your perfect getaway starts here.
        </p>
      </section>

      <section className="mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {images.map((image, index) => (
            <Card key={index} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <Image
                src={image.src}
                alt={image.alt}
                width={600}
                height={400}
                className="w-full h-auto object-cover aspect-[3/2]"
                data-ai-hint={image.hint}
              />
            </Card>
          ))}
        </div>
      </section>

      <section className="mb-16 text-center">
        <SectionTitle>Explore Our B&amp;B</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Comfortable Rooms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-body text-muted-foreground">
                Relax in our beautifully appointed rooms, designed for your ultimate comfort.
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Local Experiences</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-body text-muted-foreground">
                Explore the best of Shiobara with our curated local tips and suggestions.
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Warm Hospitality</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-body text-muted-foreground">
                Our friendly hosts are here to make your stay exceptional.
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
