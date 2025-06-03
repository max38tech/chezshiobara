
import Image from 'next/image';
import { PageContentWrapper } from '@/components/layout/page-content-wrapper';
import { PageTitle } from '@/components/ui/page-title';
import { SectionTitle } from '@/components/ui/section-title';
import { Card, CardContent, CardHeader, CardTitle as ItemCardTitle, CardDescription } from '@/components/ui/card';
import { getLocalTipsPageContent, type LocalTipItem } from '@/actions/content';
import { MapPin, Utensils,FerrisWheel,Lightbulb } from 'lucide-react'; // Example icons

const categoryIcons: Record<string, React.ElementType> = {
  "Dining": Utensils,
  "Sightseeing": MapPin,
  "Activities": FerrisWheel,
  "Hidden Gem": Lightbulb,
  "General": Lightbulb,
};

export default async function LocalTipsPage() {
  const content = await getLocalTipsPageContent();
  const tips = content?.localTips || [];

  const groupedTips = tips.reduce((acc, tip) => {
    const category = tip.category || "General";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(tip);
    return acc;
  }, {} as Record<string, LocalTipItem[]>);

  return (
    <PageContentWrapper>
      <PageTitle>Explore Like a Local</PageTitle>
      <p className="font-body text-lg text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
        Discover our curated selection of local tips, attractions, and hidden gems. We hope these recommendations help you make the most of your visit!
      </p>

      {Object.keys(groupedTips).length === 0 ? (
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <p className="font-body text-center text-muted-foreground">
              Local tips are currently being updated. Please check back soon for our recommendations!
            </p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedTips).map(([category, items]) => {
          const CategoryIcon = categoryIcons[category] || Lightbulb;
          return (
            <section key={category} className="mb-12">
              <SectionTitle as="h2" className="flex items-center gap-3 mb-6">
                <CategoryIcon className="h-8 w-8 text-primary" />
                {category}
              </SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {items.map((tip) => (
                  <Card key={tip.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
                    {tip.imageUrl && (
                      <div className="relative w-full h-48 rounded-t-lg overflow-hidden bg-muted">
                        <Image
                          src={tip.imageUrl}
                          alt={tip.title}
                          fill
                          className="object-cover"
                          data-ai-hint={tip.dataAiHint || "local scene"}
                        />
                      </div>
                    )}
                    <CardHeader>
                      <ItemCardTitle className="font-headline text-2xl">{tip.title}</ItemCardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <CardDescription className="font-body text-base text-foreground leading-relaxed">{tip.description}</CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          );
        })
      )}
    </PageContentWrapper>
  );
}
