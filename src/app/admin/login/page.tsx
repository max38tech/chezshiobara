
import { AdminLoginForm } from "@/components/specific/admin/admin-login-form";
import { PageContentWrapper } from "@/components/layout/page-content-wrapper"; // Using existing for now

export default function AdminLoginPage() {
  return (
    <PageContentWrapper className="flex min-h-screen flex-col items-center justify-center bg-muted/40">
      <AdminLoginForm />
    </PageContentWrapper>
  );
}
