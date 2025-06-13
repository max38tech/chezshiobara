
import { PageContentWrapper } from "@/components/layout/page-content-wrapper";
import { PageTitle } from "@/components/ui/page-title";
import { EditableWelcomePageTextContent } from "@/components/specific/admin/content/editable-welcome-page-text-content";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit } from "lucide-react";

export default function AdminEditWelcomePageTextPage() {
  return (
    <PageContentWrapper>
      <PageTitle className="text-3xl sm:text-4xl mb-8 text-left">Edit Welcome Page Text</PageTitle>
      <Card className="mb-8 bg-muted/30 border-border">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Edit className="h-6 w-6 text-primary" />
            Manage Welcome Page Text Content
          </CardTitle>
          <CardDescription className="font-body">
            Use this page to edit the textual content displayed on your main Welcome/Home page.
            Changes will be reflected on the public page after saving.
          </CardDescription>
        </CardHeader>
      </Card>
      <EditableWelcomePageTextContent />
    </PageContentWrapper>
  );
}
