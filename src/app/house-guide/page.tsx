
import { PageContentWrapper } from '@/components/layout/page-content-wrapper';
import { PageTitle } from '@/components/ui/page-title';
import { Accordion } from '@/components/ui/accordion';
import { AmenityGuideItem } from '@/components/specific/house-guide/amenity-guide-item';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Wifi, Coffee, Tv, Thermometer, WashingMachine, Info } from 'lucide-react'; // Example icons

const guides = [
  {
    id: "wifi",
    title: "Wi-Fi Access",
    icon: Wifi,
    content: (
      <>
        <p>Connect to our complimentary high-speed Wi-Fi to stay connected during your stay.</p>
        <p><strong>Network Name (SSID):</strong> ChezShiobara_Guest</p>
        <p><strong>Password:</strong> WelcomeToShiobara</p>
        <p>If you experience any issues, please let us know.</p>
      </>
    ),
  },
  {
    id: "coffee-machine",
    title: "Coffee Machine (In-Room/Communal)",
    icon: Coffee,
    content: (
      <>
        <p>Enjoy a fresh cup of coffee anytime. Your room is equipped with a personal coffee maker / A communal coffee station is available in the dining area.</p>
        <p><strong>Instructions:</strong></p>
        <ol className="list-decimal list-inside ml-4 space-y-1">
          <li>Fill the water reservoir with fresh cold water.</li>
          <li>Place a coffee pod/filter with ground coffee into the designated compartment.</li>
          <li>Position your mug on the tray.</li>
          <li>Press the 'Start' or brew button.</li>
        </ol>
        <p>Coffee pods, sugar, and creamer are replenished daily / available at the station. Please ask if you need more.</p>
      </>
    ),
  },
  {
    id: "television",
    title: "Television & Entertainment",
    icon: Tv,
    content: (
      <>
        <p>Your room is equipped with a smart TV offering access to various streaming services (Netflix, Hulu, etc. - guest account required for some) and local channels.</p>
        <p>Use the remote control to navigate. The 'Source' or 'Input' button allows you to switch between TV channels and HDMI inputs (e.g., for your own devices).</p>
        <p>A list of available channels is provided [Location, e.g., in the welcome booklet].</p>
      </>
    ),
  },
  {
    id: "thermostat",
    title: "Heating & Air Conditioning",
    icon: Thermometer,
    content: (
      <>
        <p>Control your room's temperature using the wall-mounted thermostat.</p>
        <p><strong>To adjust:</strong> Use the up/down arrows to set your desired temperature. Select 'Heat', 'Cool', or 'Auto' mode as needed.</p>
        <p>Please be mindful of energy consumption and turn off the AC/heater when leaving the room for extended periods or with windows open.</p>
      </>
    ),
  },
  {
    id: "laundry",
    title: "Laundry Facilities (If applicable)",
    icon: WashingMachine,
    content: (
      <>
        <p>Guest laundry facilities (washer and dryer) are available [Location, e.g., on the ground floor].</p>
        <p><strong>Operating Hours:</strong> [e.g., 8:00 AM - 9:00 PM]</p>
        <p>Detergent is [e.g., provided / available for purchase]. Please follow the instructions on the machines. We are not responsible for items damaged during washing.</p>
      </>
    ),
  },
];

export default function HouseGuidePage() {
  return (
    <PageContentWrapper>
      <PageTitle>Your Guide to Chez Shiobara</PageTitle>
      <p className="font-body text-lg text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
        Welcome! To help you make the most of your stay, here’s a quick guide to the amenities and features of our B&amp;B. If you have any questions, please don't hesitate to ask us.
      </p>
      
      <Card className="shadow-lg">
        <Accordion type="single" collapsible className="w-full">
          {guides.map((guide) => (
            <AmenityGuideItem key={guide.id} value={guide.id} title={guide.title}>
              <div className="flex items-start gap-4">
                <guide.icon className="h-8 w-8 text-primary flex-shrink-0 mt-1" aria-hidden="true" />
                <div className="flex-grow">{guide.content}</div>
              </div>
            </AmenityGuideItem>
          ))}
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
