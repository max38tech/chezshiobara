
import { PageContentWrapper } from "@/components/layout/page-content-wrapper";
import { PageTitle } from "@/components/ui/page-title";
import { EditableCommerceDisclosureContent } from "@/components/specific/admin/content/editable-commerce-disclosure-content";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

export default function AdminEditCommerceDisclosurePage() {
  return (
    <PageContentWrapper>
      <PageTitle className="text-3xl sm:text-4xl mb-8 text-left">Edit Commerce Disclosure</PageTitle>
      <Card className="mb-8 bg-muted/30 border-border">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            Manage Commerce Disclosure Content
          </CardTitle>
          <CardDescription className="font-body">
            Use this page to edit the content displayed on your Commerce Disclosure page.
            Ensure all information is accurate and up-to-date.
            Changes will be reflected on the public page after saving. Remember that some fields can accept basic HTML for formatting (e.g., &lt;em&gt; for italics, &lt;br&gt; for line breaks).
          </CardDescription>
        </CardHeader>
      </Card>
      <EditableCommerceDisclosureContent />
    </PageContentWrapper>
  );
}

