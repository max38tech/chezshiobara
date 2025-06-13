
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageContentWrapper } from '@/components/layout/page-content-wrapper';
import { PageTitle } from '@/components/ui/page-title';
import { SectionTitle } from '@/components/ui/section-title';
import { Card, CardContent, CardHeader, CardTitle as SectionCardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { getWelcomePageGalleryContent } from '@/actions/content';
import { getWelcomePageTextContent, type WelcomePageTextContent } from '@/actions/content';
import { WelcomePageGallery } from '@/components/specific/welcome/welcome-page-gallery';

export default async function WelcomePage() {
  const galleryContent = await getWelcomePageGalleryContent();
  const textContent: WelcomePageTextContent = await getWelcomePageTextContent();
  
  // Ensure images is always an array, even if galleryContent is null or galleryImages is undefined
  const images = galleryContent?.galleryImages || [];

  return (
    <PageContentWrapper>
      <PageTitle>Welcome to Chez Shiobara B&amp;B</PageTitle>
      
      <section className="text-center mb-12">
        <p className="font-body text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          {textContent.introParagraph}
        </p>
      </section>

      <section className="mb-16">
        <WelcomePageGallery images={images} />
      </section>

      <section className="mb-16 text-center">
        <SectionTitle>{textContent.exploreSectionTitle}</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <SectionCardTitle className="font-headline text-2xl">{textContent.exploreCard1Title}</SectionCardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-body text-muted-foreground">
                {textContent.exploreCard1Description}
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <SectionCardTitle className="font-headline text-2xl">{textContent.exploreCard2Title}</SectionCardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-body text-muted-foreground">
                {textContent.exploreCard2Description}
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <SectionCardTitle className="font-headline text-2xl">{textContent.exploreCard3Title}</SectionCardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-body text-muted-foreground">
                {textContent.exploreCard3Description}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
      
      <section className="text-center pb-8"> {/* Added pb-8 for spacing before footer */}
        <p className="font-body text-lg md:text-xl text-muted-foreground mb-6">
          {textContent.bookingCallToActionParagraph}
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
