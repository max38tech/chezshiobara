
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageContentWrapper } from '@/components/layout/page-content-wrapper';
import { PageTitle } from '@/components/ui/page-title';
import { SectionTitle } from '@/components/ui/section-title';
import { Card, CardContent, CardHeader, CardTitle as SectionCardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { getWelcomePageGalleryContent } from '@/actions/content';
import { WelcomePageGallery } from '@/components/specific/welcome/welcome-page-gallery';

export default async function WelcomePage() {
  const galleryContent = await getWelcomePageGalleryContent();
  // Ensure images is always an array, even if galleryContent is null or galleryImages is undefined
  const images = galleryContent?.galleryImages || [];

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
        <WelcomePageGallery images={images} />
      </section>

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
      
      <section className="text-center pb-8"> {/* Added pb-8 for spacing before footer */}
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
