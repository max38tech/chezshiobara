"use client";

import { AdminAuthProvider, useAdminAuth } from '@/contexts/admin-auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { AppLogo } from '@/components/layout/app-logo';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { AdminSidebarNav } from '@/components/specific/admin/admin-sidebar-nav';

function AdminLayoutContent({ children }: { children: ReactNode }) {
  const { adminUser, loading, logout, error: authError } = useAdminAuth();
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

  if (!adminUser && pathname !== '/admin/login') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!adminUser && pathname === '/admin/login') {
    return <>{children}</>; 
  }

  if (adminUser && pathname === '/admin/login') {
     return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Redirecting...</p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="p-4 justify-between items-center">
          <AppLogo />
        </SidebarHeader>
        <SidebarContent>
          <AdminSidebarNav />
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 w-full border-b bg-background shadow-sm">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="md:hidden"> {/* Show trigger only on mobile if sidebar is collapsible */}
              <SidebarTrigger />
            </div>
            <div className="hidden md:block w-[calc(1rem+28px)]"> {/* Placeholder for AppLogo width to align items */}
                {/* If AppLogo is always visible in header, put it here instead of sidebar header only */}
            </div>
             <div className="flex-1 flex md:hidden justify-center"> <AppLogo /></div>


            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {adminUser?.email}
              </span>
              <Button variant="outline" size="sm" onClick={async () => {
                await logout();
                router.replace('/admin/login');
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
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminAuthProvider>
  );
}
