
import { PageContentWrapper } from "@/components/layout/page-content-wrapper";
import { PageTitle } from "@/components/ui/page-title";
import { EditableGalleryImageList } from "@/components/specific/admin/content/editable-gallery-image-list";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageIcon } from "lucide-react";

export default function AdminEditGalleryPage() {
  return (
    <PageContentWrapper>
      <PageTitle className="text-3xl sm:text-4xl mb-8 text-left">Edit Welcome Page Gallery</PageTitle>
      <Card className="mb-8 bg-muted/30 border-border">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <ImageIcon className="h-6 w-6 text-primary" />
            Manage Gallery Images
          </CardTitle>
          <CardDescription className="font-body">
            Use this page to add, edit, or remove images from the Welcome Page gallery.
            Enter valid image URLs for the 'Image URL' field. Alt text is important for accessibility.
            The 'AI Hint' helps with image search suggestions (e.g., 'tropical beach', 'city skyline'). Max two words recommended.
            Changes will be reflected on the Welcome Page after saving.
          </CardDescription>
        </CardHeader>
      </Card>
      <EditableGalleryImageList />
    </PageContentWrapper>
  );
}
