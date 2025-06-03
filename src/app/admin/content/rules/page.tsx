
import { PageContentWrapper } from "@/components/layout/page-content-wrapper";
import { PageTitle } from "@/components/ui/page-title";
import { EditableRulesList } from "@/components/specific/admin/content/editable-rules-list";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminEditRulesPage() {
  return (
    <PageContentWrapper>
      <PageTitle className="text-3xl sm:text-4xl mb-8 text-left">Edit House Rules</PageTitle>
      <Card className="mb-8 bg-muted/30 border-border">
        <CardHeader>
          <CardTitle className="font-headline">Manage House Rules Content</CardTitle>
          <CardDescription className="font-body">
            Use this page to add, edit, or remove house rules that are displayed on the public "House Rules" page.
            Remember to use valid icon names from the <a href="https://lucide.dev/icons/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Lucide Icons library</a>.
            Changes will be reflected immediately after saving.
          </CardDescription>
        </CardHeader>
      </Card>
      <EditableRulesList />
    </PageContentWrapper>
  );
}
