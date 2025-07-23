"use client";

import { useState, useEffect } from 'react';
import { getInvoiceEmailContent, updateInvoiceEmailContent, InvoiceEmailContent } from '@/actions/content';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { PageTitle } from '@/components/ui/page-title';
import { SectionTitle } from '@/components/ui/section-title';

export default function InvoiceEmailAdminPage() {
  const [content, setContent] = useState<InvoiceEmailContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function loadContent() {
      setIsLoading(true);
      const loadedContent = await getInvoiceEmailContent();
      setContent(loadedContent);
      setIsLoading(false);
    }
    loadContent();
  }, []);

  const handleSave = async () => {
    if (!content) return;
    const result = await updateInvoiceEmailContent(content);
    if (result.success) {
      toast({ title: "Success", description: result.message });
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <PageTitle>Invoice Email Template</PageTitle>
      <Card>
        <CardHeader>
          <CardTitle>Edit Email Template</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Email Subject</label>
            <Input
              id="subject"
              value={content?.subject || ''}
              onChange={(e) => setContent(prev => prev ? { ...prev, subject: e.target.value } : null)}
              placeholder="Email subject"
            />
          </div>
          <div>
            <label htmlFor="body" className="block text-sm font-medium text-gray-700">Email Body (HTML)</label>
            <Textarea
              id="body"
              value={content?.body || ''}
              onChange={(e) => setContent(prev => prev ? { ...prev, body: e.target.value } : null)}
              placeholder="Email body in HTML format."
              rows={20}
            />
          </div>
          <div className="pt-4">
            <SectionTitle>Placeholders</SectionTitle>
            <p className="text-sm text-gray-600">You can use the following placeholders in the subject and body. They will be replaced with actual booking data:</p>
            <ul className="list-disc list-inside text-sm text-gray-600">
              <li><code>&#123;&#123;name&#125;&#125;</code> - Guest's full name</li>
              <li><code>&#123;&#123;bookingId&#125;&#125;</code> - Unique booking ID</li>
              <li><code>&#123;&#123;checkInDate&#125;&#125;</code> - Check-in date</li>
              <li><code>&#123;&#123;checkOutDate&#125;&#125;</code> - Check-out date</li>
              <li><code>&#123;&#123;guests&#125;&#125;</code> - Number of guests</li>
              <li><code>&#123;&#123;totalAmount&#125;&#125;</code> - Total booking amount (e.g., "1250.00 USD")</li>
              <li><code>&#123;&#123;paymentOptions&#125;&#125;</code> - The dynamically generated HTML for the payment options (Stripe, PayPal, etc.)</li>
            </ul>
          </div>
          <Button onClick={handleSave}>Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
}
