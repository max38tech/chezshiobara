import { PageContentWrapper } from '@/components/layout/page-content-wrapper';
import { PageTitle } from '@/components/ui/page-title';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Clock, Users, CigaretteOff, Waves, PawPrint, PartyPopper, Volume2 } from 'lucide-react'; // Example icons

const rules = [
  {
    icon: Clock,
    title: "Check-in & Check-out",
    description: "Check-in is after 3:00 PM. Check-out is before 11:00 AM. Early check-in or late check-out may be available upon request and subject to availability (additional fees may apply).",
  },
  {
    icon: CigaretteOff,
    title: "No Smoking",
    description: "Chez Shiobara is a smoke-free property. Smoking (including e-cigarettes and vaping) is strictly prohibited inside the building and on balconies. A designated outdoor smoking area is available.",
  },
  {
    icon: Users,
    title: "Guests & Visitors",
    description: "Only registered guests are permitted on the premises overnight. Please inform us in advance if you plan to have daytime visitors. Maximum occupancy per room must be respected.",
  },
  {
    icon: Volume2,
    title: "Quiet Hours",
    description: "Please observe quiet hours from 10:00 PM to 8:00 AM to ensure a peaceful environment for all guests.",
  },
  {
    icon: PawPrint,
    title: "Pets Policy",
    description: "We love animals, but unfortunately, we cannot accommodate pets at this time, with the exception of certified service animals as required by law.",
  },
  {
    icon: Waves,
    title: "Amenities Usage",
    description: "Please use all B&B amenities responsibly. Instructions for appliances and facilities are provided in the House Guide. Report any damages or malfunctions immediately.",
  },
  {
    icon: PartyPopper,
    title: "No Parties or Events",
    description: "Parties or large gatherings are not permitted on the premises without prior written consent from the management.",
  },
];

export default function RulesPage() {
  return (
    <PageContentWrapper>
      <PageTitle>House Rules</PageTitle>
      <p className="font-body text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
        To ensure a pleasant and comfortable stay for all our guests, we kindly ask you to observe the following house rules. Thank you for your cooperation!
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {rules.map((rule, index) => (
          <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <rule.icon className="h-8 w-8 text-primary" aria-hidden="true" />
              <CardTitle className="font-headline text-2xl">{rule.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-body text-base text-foreground leading-relaxed">{rule.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

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
