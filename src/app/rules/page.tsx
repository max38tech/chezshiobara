
import { PageContentWrapper } from '@/components/layout/page-content-wrapper';
import { PageTitle } from '@/components/ui/page-title';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Clock, Users, CigaretteOff, Waves, PawPrint, PartyPopper, Volume2, type LucideIcon, AlertTriangle } from 'lucide-react';
import { getRulesPageContent, type RuleItem } from '@/actions/content'; // Assuming content actions will be here

// Helper to map icon names to Lucide components
const iconMap: Record<string, LucideIcon> = {
  Clock,
  Users,
  CigaretteOff,
  Waves,
  PawPrint,
  PartyPopper,
  Volume2,
  CheckCircle2,
  AlertTriangle, // Default icon
};

const DefaultIcon = AlertTriangle; // Fallback icon

export default async function RulesPage() {
  const rulesContent = await getRulesPageContent();

  return (
    <PageContentWrapper>
      <PageTitle>House Rules</PageTitle>
      <p className="font-body text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
        To ensure a pleasant and comfortable stay for all our guests, we kindly ask you to observe the following house rules. Thank you for your cooperation!
      </p>
      
      {rulesContent && rulesContent.rulesList && rulesContent.rulesList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {rulesContent.rulesList.map((rule) => {
            const IconComponent = iconMap[rule.icon] || DefaultIcon;
            return (
              <Card key={rule.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <IconComponent className="h-8 w-8 text-primary" aria-hidden="true" />
                  <CardTitle className="font-headline text-2xl">{rule.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-body text-base text-foreground leading-relaxed">{rule.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <p className="font-body text-center text-muted-foreground">
              House rules are currently not available. Please check back later.
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="mt-12 bg-accent/20 border-accent">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-primary" />
            A Note on Respect
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-body text-base text-foreground leading-relaxed">
            We strive to create a peaceful and respectful environment for everyone. Please be considerate of other guests and our property. Any violation of these rules may result in penalties or termination of your stay without refund. If you have any questions or require clarification on any rule, please don't hesitate to ask us.
          </p>
        </CardContent>
      </Card>
    </PageContentWrapper>
  );
}

