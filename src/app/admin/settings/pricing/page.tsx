
import { PageContentWrapper } from "@/components/layout/page-content-wrapper";
import { PageTitle } from "@/components/ui/page-title";
import { EditablePricingConfiguration } from "@/components/specific/admin/settings/editable-pricing-configuration";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

export default function AdminPricingSettingsPage() {
  return (
    <PageContentWrapper>
      <PageTitle className="text-3xl sm:text-4xl mb-8 text-left">Pricing Configuration</PageTitle>
      <Card className="mb-8 bg-muted/30 border-border">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-primary" />
            Manage Pricing Tiers
          </CardTitle>
          <CardDescription className="font-body">
            Set the different pricing tiers for your B&B. These prices will be used for generating invoices.
            All prices are in USD (United States Dollar).
          </CardDescription>
        </CardHeader>
      </Card>
      <EditablePricingConfiguration />
    </PageContentWrapper>
  );
}

