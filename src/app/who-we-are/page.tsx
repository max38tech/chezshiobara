
import Image from 'next/image';
import { PageContentWrapper } from '@/components/layout/page-content-wrapper';
import { PageTitle } from '@/components/ui/page-title';
import { SectionTitle } from '@/components/ui/section-title';
import { Card, CardContent } from '@/components/ui/card';
import { getWhoWeArePageContent } from '@/actions/content';

export default async function WhoWeArePage() {
  const content = await getWhoWeArePageContent();

  if (!content) {
    return (
      <PageContentWrapper>
        <PageTitle>Meet Your Hosts</PageTitle>
        <p className="text-center text-muted-foreground">Content for this page is currently unavailable. Please check back soon!</p>
      </PageContentWrapper>
    );
  }

  return (
    <PageContentWrapper>
      <PageTitle>{content.pageTitle}</PageTitle>
      
      <section className="mb-12">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          <div className="lg:w-1/2">
            <Card className="overflow-hidden shadow-lg">
              <Image
                src={content.heroImage.src}
                alt={content.heroImage.alt}
                width={600}
                height={750}
                className="w-full h-auto object-cover"
                data-ai-hint={content.heroImage.dataAiHint}
                priority // Prioritize hero image
              />
            </Card>
          </div>
          <div className="lg:w-1/2">
            <SectionTitle as="h2" className="text-left">{content.ourStorySection.title}</SectionTitle>
            {content.ourStorySection.paragraphs.map((para) => (
              <p key={para.id} className="font-body text-lg text-foreground mb-6 leading-relaxed">
                {para.text}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section>
        <SectionTitle as="h2" className="text-center">{content.ourPhilosophySection.title}</SectionTitle>
        <Card>
          <CardContent className="pt-6">
            <p className="font-body text-lg text-foreground mb-4 leading-relaxed">
              {content.ourPhilosophySection.introParagraph}
            </p>
            <ul className="list-disc list-inside font-body text-lg text-foreground space-y-2 leading-relaxed">
              {content.ourPhilosophySection.philosophyItems.map((item) => (
                <li key={item.id}>
                  <strong className="font-headline">{item.title}:</strong> {item.description}
                </li>
              ))}
            </ul>
            {/* Optional: A concluding paragraph can be added here if needed, fetched from content too */}
          </CardContent>
        </Card>
      </section>
    </PageContentWrapper>
  );
}
