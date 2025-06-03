
import { PageContentWrapper } from '@/components/layout/page-content-wrapper';
import { PageTitle } from '@/components/ui/page-title';
import { Accordion } from '@/components/ui/accordion';
import { AmenityGuideItem } from '@/components/specific/house-guide/amenity-guide-item';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Wifi, Coffee, Tv, Thermometer, WashingMachine, Info, AlertTriangle, type LucideIcon } from 'lucide-react';
import { getHouseGuideContent, type HouseGuideItem as HouseGuideItemData } from '@/actions/content';

// Helper to map icon names to Lucide components
const iconMap: Record<string, LucideIcon> = {
  Wifi,
  Coffee,
  Tv,
  Thermometer,
  WashingMachine,
  Info,
  AlertTriangle, // Default/fallback icon
};

const DefaultIcon = AlertTriangle;

export default async function HouseGuidePage() {
  const guideContent = await getHouseGuideContent();

  return (
    <PageContentWrapper>
      <PageTitle>Your Guide to Chez Shiobara</PageTitle>
      <p className="font-body text-lg text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
        Welcome! To help you make the most of your stay, here’s a quick guide to the amenities and features of our B&amp;B. If you have any questions, please don't hesitate to ask us.
      </p>
      
      <Card className="shadow-lg">
        <Accordion type="single" collapsible className="w-full">
          {guideContent && guideContent.guideItems && guideContent.guideItems.length > 0 ? (
            guideContent.guideItems.map((guide: HouseGuideItemData) => {
              const IconComponent = iconMap[guide.icon] || DefaultIcon;
              return (
                <AmenityGuideItem key={guide.id} value={guide.id} title={guide.title}>
                  <div className="flex items-start gap-4">
                    <IconComponent className="h-8 w-8 text-primary flex-shrink-0 mt-1" aria-hidden="true" />
                    {/* Render content, respecting newlines */}
                    <div className="flex-grow whitespace-pre-wrap">{guide.content}</div>
                  </div>
                </AmenityGuideItem>
              );
            })
          ) : (
             <AmenityGuideItem value="no-content" title="Guide Not Available">
                <div className="flex items-start gap-4">
                    <DefaultIcon className="h-8 w-8 text-primary flex-shrink-0 mt-1" aria-hidden="true" />
                    <div className="flex-grow">
                        <p>Information for the house guide is currently being updated. Please check back soon!</p>
                    </div>
                </div>
            </AmenityGuideItem>
          )}
        </Accordion>
      </Card>

      <Card className="mt-12 bg-accent/20 border-accent">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center gap-2">
            <Info className="h-6 w-6 text-primary" />
            Need Assistance?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-body text-base text-foreground leading-relaxed">
            If you encounter any issues with the amenities or need further assistance, please contact us immediately. 
            You can reach us by phone at <a href="tel:+8107090582258" className="text-primary hover:text-primary/80 transition-colors font-medium">+81 070 9058 2258</a> or 
            email at <a href="mailto:us@shiobara.love" className="text-primary hover:text-primary/80 transition-colors font-medium">us@shiobara.love</a>. 
            For quick communication, especially if you primarily use data, we'll create a WhatsApp group with you upon check-in. You can also reach us directly on WhatsApp: <a href="https://wa.me/8107090582258" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors font-medium">Message us on WhatsApp</a>.
            We're here to ensure your stay is comfortable and enjoyable!
          </p>
        </CardContent>
      </Card>
    </PageContentWrapper>
  );
}
