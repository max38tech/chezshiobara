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
    <PageContentWrapper className="max-w-6xl mx-auto px-4">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 lg:gap-8">
                {items.map((tip) => (
                  <Card key={tip.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
                    {tip.imageUrl && (
                      <div className="w-full rounded-t-lg overflow-hidden bg-muted">
                        {tip.imageLinkUrl ? (
                          <a href={tip.imageLinkUrl} target="_blank" rel="noopener noreferrer">
                            <Image
                              src={tip.imageUrl}
                              alt={tip.title}
                              width={600}
                              height={192}
                              className="object-cover"
                            />
                          </a>
                        ) : (
                          <Image
                            src={tip.imageUrl}
                            alt={tip.title}
                            width={600}
                            height={192}
                            className="object-cover"
                          />
                        )}
                      </div>
                    )}
                    <CardHeader>
                      <ItemCardTitle className="font-headline text-2xl">{tip.title}</ItemCardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <CardDescription className="font-body text-base text-foreground leading-relaxed">
                        {autoLinkify(tip.description)}
                      </CardDescription>
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

// Add this utility function at the top (after imports):
function autoLinkify(text: string) {
  const urlRegex = /(https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=%]+)|(www\.[\w\-._~:/?#[\]@!$&'()*+,;=%]+)/gi;
  const parts = text.split(urlRegex);
  return parts.map((part, i) => {
    if (!part) return null;
    if (part.match(urlRegex)) {
      const href = part.startsWith('http') ? part : `https://${part}`;
      return <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="underline text-primary break-all">{part}</a>;
    }
    return <span key={i}>{part}</span>;
  });
}
