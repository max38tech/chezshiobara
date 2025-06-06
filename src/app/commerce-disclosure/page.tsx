
import { PageContentWrapper } from '@/components/layout/page-content-wrapper';
import { PageTitle } from '@/components/ui/page-title';
import { SectionTitle } from '@/components/ui/section-title';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Link from 'next/link';
import { getCommerceDisclosureContent, type CommerceDisclosureContent } from '@/actions/content';

// Helper component to render multiline text with HTML (use with caution)
const MultilineHtmlContent = ({ htmlString }: { htmlString?: string }) => {
  if (!htmlString) return null;
  // Replace newlines with <br /> for display, assuming content is trusted or sanitized.
  const processedHtml = htmlString.replace(/\n/g, '<br />');
  return <p dangerouslySetInnerHTML={{ __html: processedHtml }} />;
};

const Section = ({ title, children, showIfEmpty = false }: { title: string; children: React.ReactNode, showIfEmpty?: boolean }) => {
  if (!children && !showIfEmpty) return null;
  return (
    <div>
      <h3 className="font-headline text-xl mb-2">{title}</h3>
      <div className="font-body text-foreground leading-relaxed space-y-2">
        {children || <p className="text-muted-foreground">N/A</p>}
      </div>
    </div>
  );
};


export default async function CommerceDisclosurePage() {
  const content: CommerceDisclosureContent | null = await getCommerceDisclosureContent();

  if (!content) {
    return (
      <PageContentWrapper>
        <PageTitle>Commerce Disclosure</PageTitle>
        <Card className="shadow-lg mb-8">
          <CardHeader>
            <SectionTitle as="h2" className="mb-0">Important Information</SectionTitle>
          </CardHeader>
          <CardContent>
            <p className="font-body text-center text-muted-foreground">
              Commerce disclosure information is currently unavailable. Please check back later or contact us.
            </p>
          </CardContent>
        </Card>
      </PageContentWrapper>
    );
  }
  
  const lastUpdatedDate = content.updatedAt ? new Date(content.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });


  return (
    <PageContentWrapper>
      <PageTitle>Commerce Disclosure</PageTitle>
      
      <Card className="shadow-lg mb-8">
        <CardHeader>
          <SectionTitle as="h2" className="mb-0">Important Information</SectionTitle>
        </CardHeader>
        <CardContent className="space-y-6 font-body text-foreground leading-relaxed">
          <p>
            This page provides important information about Chez Shiobara B&B and our commerce practices, in line with transparency and regulatory requirements.
          </p>

          <Section title="Business Name">
            <p>{content.businessName}</p>
          </Section>

          {content.legalName && (
            <Section title="Legal Name">
              <p>{content.legalName}</p>
            </Section>
          )}

          <Section title="Business Address">
            <MultilineHtmlContent htmlString={content.businessAddress} />
          </Section>

          <Section title="Contact Information">
            <p>Email: <a href={`mailto:${content.contactEmail}`} className="text-accent hover:underline">{content.contactEmail}</a></p>
            <p>Phone: <a href={`tel:${content.contactPhone}`} className="text-accent hover:underline">{content.contactPhone}</a></p>
          </Section>

          <Section title="Business Registration Information">
            <MultilineHtmlContent htmlString={content.businessRegistrationInfo} />
          </Section>

          <Section title="Description of Goods and Services">
             <MultilineHtmlContent htmlString={content.descriptionOfGoods} />
          </Section>

          <Section title="Transaction Currency">
            <MultilineHtmlContent htmlString={content.transactionCurrencyInfo} />
          </Section>

          <Section title="Payment Methods Accepted">
            <MultilineHtmlContent htmlString={content.paymentMethodsInfo} />
          </Section>

          <Section title="Refund and Cancellation Policy">
            <MultilineHtmlContent htmlString={content.refundCancellationPolicy} />
          </Section>

          <Section title="Delivery / Shipping Policy">
            <MultilineHtmlContent htmlString={content.deliveryShippingPolicy} />
          </Section>

          <Section title="Privacy Policy">
            <MultilineHtmlContent htmlString={content.privacyPolicySummary} />
             <p className="mt-2 text-sm text-muted-foreground">
              <em>We recommend creating a more detailed, standalone Privacy Policy page and linking to it from here for comprehensive coverage.</em>
            </p>
          </Section>
          
          <Section title="Terms of Service">
            <MultilineHtmlContent htmlString={content.termsOfServiceSummary} />
            <p className="mt-1">By making a booking with Chez Shiobara B&B, you also acknowledge and agree to comply with our <Link href="/rules" className="text-accent hover:underline">House Rules</Link>.</p>
             <p className="mt-2 text-sm text-muted-foreground">
              <em>We recommend creating a more detailed, standalone Terms of Service page and linking to it from here.</em>
            </p>
          </Section>

          <Section title="Export Restrictions">
            <MultilineHtmlContent htmlString={content.exportRestrictionsInfo} />
          </Section>

          <Section title="Customer Service Contact">
            <MultilineHtmlContent htmlString={content.customerServiceContactInfo} />
            <p className="mt-1">You can also reach us via the contact form on our <Link href="/contact" className="text-accent hover:underline">Contact Us page</Link>.</p>
          </Section>
          
          <p className="text-sm text-muted-foreground pt-4 border-t mt-6">
            This Commerce Disclosure was last updated on {lastUpdatedDate}. We reserve the right to modify this disclosure at any time.
          </p>

        </CardContent>
      </Card>
    </PageContentWrapper>
  );
}

