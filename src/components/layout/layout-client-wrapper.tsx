"use client";

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import type { ReactNode } from 'react';

interface LayoutClientWrapperProps {
  children: ReactNode;
}

export function LayoutClientWrapper({ children }: LayoutClientWrapperProps) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  return (
    <>
      {!isAdminPage && <Navbar />}
      {children}
    </>
  );
}
