
import { PageContentWrapper } from "@/components/layout/page-content-wrapper";
import { PageTitle } from "@/components/ui/page-title";
import { EditableHouseGuideList } from "@/components/specific/admin/content/editable-house-guide-list";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminEditHouseGuidePage() {
  return (
    <PageContentWrapper>
      <PageTitle className="text-3xl sm:text-4xl mb-8 text-left">Edit House Guide</PageTitle>
      <Card className="mb-8 bg-muted/30 border-border">
        <CardHeader>
          <CardTitle className="font-headline">Manage House Guide Content</CardTitle>
          <CardDescription className="font-body">
            Use this page to add, edit, or remove items from the House Guide.
            Remember to use valid icon names from the <a href="https://lucide.dev/icons/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Lucide Icons library</a>.
            Changes will be reflected immediately after saving.
          </CardDescription>
        </CardHeader>
      </Card>
      <EditableHouseGuideList />
    </PageContentWrapper>
  );
}
