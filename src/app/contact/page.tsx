
import { PageContentWrapper } from '@/components/layout/page-content-wrapper';
import { PageTitle } from '@/components/ui/page-title';
import { SectionTitle } from '@/components/ui/section-title';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ContactForm } from '@/components/specific/contact/contact-form';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactPage() {
  return (
    <PageContentWrapper>
      <PageTitle>Get In Touch</PageTitle>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start mb-12">
        <Card className="shadow-lg lg:col-span-2">
          <CardHeader>
            <SectionTitle as="h2" className="mb-0">Send Us a Message</SectionTitle>
          </CardHeader>
          <CardContent>
            <p className="font-body text-muted-foreground mb-6">
              Have a question or a special request? Fill out the form below, and we'll get back to you as soon as possible.
            </p>
            <ContactForm />
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <SectionTitle as="h2" className="mb-2">Contact Details</SectionTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-4">
              <Mail className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-headline text-lg text-foreground">Email Us</h3>
                <a href="mailto:us@shiobara.love" className="font-body text-accent hover:text-accent/80 transition-colors">
                  us@shiobara.love
                </a>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Phone className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-headline text-lg text-foreground">Call Us</h3>
                <a href="tel:+8107090582258" className="font-body text-accent hover:text-accent/80 transition-colors">
                  +81 070 9058 2258
                </a>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <MapPin className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-headline text-lg text-foreground">Our Address</h3>
                <p className="font-body text-foreground">
                  16-7 Karasawa, Minami-ku<br />
                  Yokohama, Kanagawa 232-0034<br />
                  Japan
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <SectionTitle as="h2" className="mb-0">Find Us On The Map</SectionTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-muted rounded-md overflow-hidden">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3251.645906652188!2d139.6079729768349!3d35.41398777266832!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60185bc00782a467%3A0xc6b9495f88a74921!2s16-7%20Karasawa%2C%20Minami%20Ward%2C%20Yokohama%2C%20Kanagawa%20232-0034%2C%20Japan!5e0!3m2!1sen!2sus!4v1716490000000!5m2!1sen!2sus"
              width="100%" 
              height="100%" 
              style={{ border:0 }} 
              allowFullScreen={false} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Location of Chez Shiobara B&B on Google Maps"
            ></iframe>
          </div>
        </CardContent>
      </Card>
    </PageContentWrapper>
  );
}
