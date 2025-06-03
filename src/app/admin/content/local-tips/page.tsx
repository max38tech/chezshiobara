
import { PageContentWrapper } from "@/components/layout/page-content-wrapper";
import { PageTitle } from "@/components/ui/page-title";
import { EditableLocalTipsList } from "@/components/specific/admin/content/editable-local-tips-list";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

export default function AdminEditLocalTipsPage() {
  return (
    <PageContentWrapper>
      <PageTitle className="text-3xl sm:text-4xl mb-8 text-left">Edit Local Tips</PageTitle>
      <Card className="mb-8 bg-muted/30 border-border">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-primary" />
            Manage Local Tips & Attractions
          </CardTitle>
          <CardDescription className="font-body">
            Use this page to add, edit, or remove local tips. These will be displayed on the "Local Tips" page for your guests.
            You can include a title, description, category (e.g., "Dining", "Sightseeing"), and an optional image URL.
            The 'AI Hint' is for the image if you provide one.
          </CardDescription>
        </CardHeader>
      </Card>
      <EditableLocalTipsList />
    </PageContentWrapper>
  );
}
