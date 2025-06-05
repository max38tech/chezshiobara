
import { PageContentWrapper } from '@/components/layout/page-content-wrapper';
import { PageTitle } from '@/components/ui/page-title';
import { SectionTitle } from '@/components/ui/section-title';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Link from 'next/link';

export default function CommerceDisclosurePage() {
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

          <div>
            <h3 className="font-headline text-xl mb-2">Business Name</h3>
            <p>Chez Shiobara B&B</p>
          </div>

          <div>
            <h3 className="font-headline text-xl mb-2">Business Address</h3>
            <p>
              16-7 Karasawa, Minami-ku<br />
              Yokohama, Kanagawa 232-0034<br />
              Japan
            </p>
          </div>

          <div>
            <h3 className="font-headline text-xl mb-2">Contact Information</h3>
            <p>Email: <a href="mailto:us@shiobara.love" className="text-accent hover:underline">us@shiobara.love</a></p>
            <p>Phone: <a href="tel:+8107090582258" className="text-accent hover:underline">+81 070 9058 2258</a></p>
          </div>

          <div>
            <h3 className="font-headline text-xl mb-2">Business Registration Information</h3>
            <p>
              Chez Shiobara B&B is operated by [Your Legal Entity Name, if applicable].
              <br />
              Business Registration Number (Japan): [Your Business Registration Number, if applicable. E.g., XXXXXXXXXXXXX]
              <br />
              <em className="text-sm text-muted-foreground">Please update this section with your specific legal entity name and registration number if you have one. If you are operating as an individual without a separate business registration, you may need to adjust this or consult local regulations.</em>
            </p>
          </div>

          <div>
            <h3 className="font-headline text-xl mb-2">Description of Goods and Services</h3>
            <p>
              Chez Shiobara B&B offers short-term accommodation services. This includes lodging in our guest room(s), and may include breakfast and access to common household amenities as described on our website and during the booking process.
            </p>
          </div>

          <div>
            <h3 className="font-headline text-xl mb-2">Transaction Currency</h3>
            <p>
              All prices and transactions are processed in USD (United States Dollars), unless explicitly stated otherwise during the booking or payment process. Your card issuer may apply their own exchange rates and fees if your card is not denominated in USD.
            </p>
          </div>

          <div>
            <h3 className="font-headline text-xl mb-2">Payment Methods Accepted</h3>
            <p>
              We primarily accept payments via major credit and debit cards (Visa, MasterCard, American Express, etc.) processed securely through Stripe.
              Other payment methods, such as PayPal or Wise, may be available and will be indicated during the booking confirmation process or can be viewed on our admin-managed payment settings (information provided upon request for guests).
            </p>
          </div>

          <div>
            <h3 className="font-headline text-xl mb-2 text-destructive">Refund and Cancellation Policy</h3>
            <p className="font-bold text-destructive">
              IMPORTANT: The following is a general template. Please replace this with your actual, specific cancellation policy.
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Cancellations made more than <strong className="text-destructive">[Specify Number, e.g., 14]</strong> days prior to the scheduled check-in date will receive a full refund of the amount paid, minus any non-refundable transaction fees charged by payment processors.</li>
              <li>Cancellations made between <strong className="text-destructive">[Specify Number, e.g., 7]</strong> and <strong className="text-destructive">[Specify Number, e.g., 14]</strong> days prior to the scheduled check-in date will be eligible for a <strong className="text-destructive">[Specify Percentage, e.g., 50]%</strong> refund of the total booking cost.</li>
              <li>Cancellations made less than <strong className="text-destructive">[Specify Number, e.g., 7]</strong> days prior to the scheduled check-in date, or in the case of a no-show, are non-refundable, and the full booking amount will be forfeited.</li>
              <li>Early departures are typically treated as last-minute cancellations for the remaining nights and are non-refundable unless otherwise agreed upon in writing by Chez Shiobara B&B management.</li>
              <li>Modifications to booking dates are subject to availability and may be subject to rate changes. Significant changes may be treated as a cancellation and re-booking.</li>
              <li>We strongly recommend guests consider travel insurance to cover unforeseen circumstances that may lead to cancellation.</li>
              <li>To request a cancellation or modification, please contact us directly via email at <a href="mailto:us@shiobara.love" className="text-accent hover:underline">us@shiobara.love</a> as soon as possible.</li>
            </ul>
            <p className="mt-2 text-sm text-muted-foreground">
              This policy is subject to change. The policy in effect at the time of your booking will apply. Please refer to your booking confirmation for specific terms.
            </p>
          </div>

          <div>
            <h3 className="font-headline text-xl mb-2">Delivery / Shipping Policy</h3>
            <p>
              As Chez Shiobara B&B provides accommodation and related services, no physical goods are shipped. All booking confirmations and communications will be delivered electronically via email to the address provided during the booking process.
            </p>
          </div>

          <div>
            <h3 className="font-headline text-xl mb-2">Privacy Policy</h3>
            <p>
              We are committed to protecting your privacy. Personal information (such as name, email address, payment details) collected during the booking and payment process is used solely for the purposes of:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Securing and managing your booking.</li>
              <li>Processing payments securely via our payment gateway (Stripe).</li>
              <li>Communicating with you regarding your stay (confirmations, pre-arrival information, post-stay follow-up).</li>
              <li>Complying with legal or regulatory requirements in Japan.</li>
            </ul>
            <p className="mt-2">
              We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties for their marketing purposes without your explicit consent, except as necessary to provide our services (e.g., sharing necessary details with Stripe for payment processing). We implement a variety of security measures to maintain the safety of your personal information.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              <em>We recommend creating a more detailed, standalone Privacy Policy page and linking to it from here for comprehensive coverage.</em>
            </p>
          </div>
          
          <div>
            <h3 className="font-headline text-xl mb-2">Terms of Service</h3>
            <p>
              By making a booking with Chez Shiobara B&B, you acknowledge and agree to comply with our <Link href="/rules" className="text-accent hover:underline">House Rules</Link>, our payment terms, and the cancellation policy stated herein. All guests are expected to behave in a respectful manner towards hosts, other guests (if any), and the property. Failure to comply may result in termination of your stay without refund.
            </p>
             <p className="mt-2 text-sm text-muted-foreground">
              <em>We recommend creating a more detailed, standalone Terms of Service page and linking to it from here.</em>
            </p>
          </div>

          <div>
            <h3 className="font-headline text-xl mb-2">Export Restrictions</h3>
            <p>Not applicable to the services offered by Chez Shiobara B&B.</p>
          </div>

          <div>
            <h3 className="font-headline text-xl mb-2">Customer Service Contact</h3>
            <p>
              For any questions, concerns, or assistance regarding your booking, payment, our services, or this disclosure, please contact us:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Email: <a href="mailto:us@shiobara.love" className="text-accent hover:underline">us@shiobara.love</a></li>
              <li>Phone: <a href="tel:+8107090582258" className="text-accent hover:underline">+81 070 9058 2258</a></li>
              <li>You can also reach us via the contact form on our <Link href="/contact" className="text-accent hover:underline">Contact Us page</Link>.</li>
            </ul>
          </div>
          
          <p className="text-sm text-muted-foreground pt-4 border-t mt-6">
            This Commerce Disclosure was last updated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}. We reserve the right to modify this disclosure at any time.
          </p>

        </CardContent>
      </Card>
    </PageContentWrapper>
  );
}

