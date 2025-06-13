
import { PageContentWrapper } from "@/components/layout/page-content-wrapper";
import { PageTitle } from "@/components/ui/page-title";
import { EditableWhoWeAreContent } from "@/components/specific/admin/content/editable-who-we-are-content";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function AdminEditWhoWeArePage() {
  return (
    <PageContentWrapper>
      <PageTitle className="text-3xl sm:text-4xl mb-8 text-left">Edit &quot;Who We Are&quot; Page</PageTitle>
      <Card className="mb-8 bg-muted/30 border-border">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Manage &quot;Who We Are&quot; Content
          </CardTitle>
          <CardDescription className="font-body">
            Use this page to edit the content displayed on your &quot;Who We Are&quot; page.
            You can update the page title, hero image, story paragraphs, and philosophy points.
            Changes will be reflected on the public page after saving.
          </CardDescription>
        </CardHeader>
      </Card>
      <EditableWhoWeAreContent />
    </PageContentWrapper>
  );
}
