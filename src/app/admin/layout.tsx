
"use client";

import { AdminAuthProvider, useAdminAuth } from '@/contexts/admin-auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { AppLogo } from '@/components/layout/app-logo';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

function AdminLayoutContent({ children }: { children: ReactNode }) {
  const { adminUser, loading, logout, error: authError } = useAdminAuth(); // Added authError for potential debugging
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !adminUser && pathname !== '/admin/login') {
      console.log("AdminLayout: Not loading, no adminUser, not on login page. Redirecting to /admin/login. Current pathname:", pathname);
      router.replace('/admin/login');
    }
    if (!loading && adminUser && pathname === '/admin/login') {
      console.log("AdminLayout: Not loading, adminUser exists, on login page. Redirecting to /admin. Current pathname:", pathname);
      router.replace('/admin');
    }
  }, [adminUser, loading, router, pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading Admin Portal...</p>
      </div>
    );
  }

  // This case handles rendering the login page or redirecting if auth state isn't ready or user is not found
  if (!adminUser && pathname !== '/admin/login') {
     // If still loading or redirecting, show a minimal loader or nothing to avoid flashes
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!adminUser && pathname === '/admin/login') {
    return <>{children}</>; // Render login page children
  }

  if (adminUser && pathname === '/admin/login') {
    // This should be handled by useEffect redirect, but as a fallback
     return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Redirecting...</p>
      </div>
    );
  }


  // Render admin content if user is authenticated and not on login page
  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <header className="sticky top-0 z-40 w-full border-b bg-background shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <AppLogo />
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {adminUser?.email}
            </span>
            <Button variant="outline" size="sm" onClick={async () => {
              await logout();
              router.replace('/admin/login'); // Ensure redirect after logout
            }}>
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="py-4 text-center text-xs text-muted-foreground border-t bg-background">
        Chez Shiobara B&B Admin Portal
      </footer>
    </div>
  );
}

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminAuthProvider>
  );
}
