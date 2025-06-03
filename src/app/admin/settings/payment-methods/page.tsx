
import { PageContentWrapper } from "@/components/layout/page-content-wrapper";
import { PageTitle } from "@/components/ui/page-title";
import { EditablePaymentSettings } from "@/components/specific/admin/settings/editable-payment-settings";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

export default function AdminPaymentSettingsPage() {
  return (
    <PageContentWrapper>
      <PageTitle className="text-3xl sm:text-4xl mb-8 text-left">Payment Methods</PageTitle>
      <Card className="mb-8 bg-muted/30 border-border">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            Configure Your Payment Methods
          </CardTitle>
          <CardDescription className="font-body">
            Set up the payment methods you accept. This information will be used when generating invoices and payment instructions for your guests.
            Ensure your email settings (EMAIL_USER and EMAIL_PASS in .env) are configured if you plan to email invoices.
          </CardDescription>
        </CardHeader>
      </Card>
      <EditablePaymentSettings />
    </PageContentWrapper>
  );
}
