import Image from 'next/image';
import { PageContentWrapper } from '@/components/layout/page-content-wrapper';
import { PageTitle } from '@/components/ui/page-title';
import { SectionTitle } from '@/components/ui/section-title';
import { Card, CardContent } from '@/components/ui/card';

export default function WhoWeArePage() {
  return (
    <PageContentWrapper>
      <PageTitle>Meet Your Hosts</PageTitle>
      
      <section className="mb-12">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          <div className="lg:w-1/2">
            <Card className="overflow-hidden shadow-lg">
              <Image
                src="https://placehold.co/600x750.png"
                alt="The hosts of Chez Shiobara B&B"
                width={600}
                height={750}
                className="w-full h-auto object-cover"
                data-ai-hint="friendly couple"
              />
            </Card>
          </div>
          <div className="lg:w-1/2">
            <SectionTitle as="h2" className="text-left">Our Story</SectionTitle>
            <p className="font-body text-lg text-foreground mb-6 leading-relaxed">
              Welcome to Chez Shiobara! We are [Host Name 1] and [Host Name 2], your hosts and the proud owners of this little piece of paradise. 
              Our journey into the world of hospitality began with a shared dream: to create a welcoming space where guests could escape the everyday 
              and immerse themselves in the beauty and tranquility of Shiobara.
            </p>
            <p className="font-body text-lg text-foreground mb-6 leading-relaxed">
              Having explored many corners of the world and experienced various cultures, we fell in love with the unique charm of Shiobara. Its breathtaking natural landscapes, 
              rich history, and warm local community inspired us to establish a B&B that reflects our passion for travel, comfort, and genuine connection.
            </p>
            <p className="font-body text-lg text-foreground leading-relaxed">
              We've poured our hearts into every detail of Chez Shiobara, from the carefully curated decor to the locally sourced ingredients for your breakfast. 
              Our goal is to offer more than just a place to stay; we aim to provide an experience that feels like a home away from home, filled with warmth, 
              personal touches, and the discovery of local wonders.
            </p>
          </div>
        </div>
      </section>

      <section>
        <SectionTitle as="h2" className="text-center">Our Philosophy</SectionTitle>
        <Card>
          <CardContent className="pt-6">
            <p className="font-body text-lg text-foreground mb-4 leading-relaxed">
              At Chez Shiobara, we believe in:
            </p>
            <ul className="list-disc list-inside font-body text-lg text-foreground space-y-2 leading-relaxed">
              <li><strong className="font-headline">Genuine Hospitality:</strong> Making you feel truly welcome and cared for.</li>
              <li><strong className="font-headline">Local Immersion:</strong> Helping you connect with the authentic culture and nature of Shiobara.</li>
              <li><strong className="font-headline">Comfort and Quality:</strong> Ensuring every aspect of your stay is comfortable and of high quality.</li>
              <li><strong className="font-headline">Sustainable Practices:</strong> Respecting our environment and supporting our local community.</li>
            </ul>
            <p className="font-body text-lg text-foreground mt-6 leading-relaxed">
              We look forward to welcoming you to Chez Shiobara and sharing our love for this beautiful region with you. Whether you're seeking adventure, relaxation, or a bit of both, 
              we're here to help make your stay memorable.
            </p>
          </CardContent>
        </Card>
      </section>
    </PageContentWrapper>
  );
}
