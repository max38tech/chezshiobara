
"use client";

import Link from "next/link";
import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  if (isAdminPage) {
    return null; // Don't show this footer on admin pages
  }

  return (
    <footer className="border-t border-border/40 bg-background/95 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-x-6 gap-y-2 mb-4">
          <Link href="/contact" className="font-body text-sm text-muted-foreground hover:text-accent transition-colors">
            Contact Us
          </Link>
          <Link href="/rules" className="font-body text-sm text-muted-foreground hover:text-accent transition-colors">
            House Rules
          </Link>
          <Link href="/commerce-disclosure" className="font-body text-sm text-muted-foreground hover:text-accent transition-colors">
            Commerce Disclosure
          </Link>
          {/* Add links to Privacy Policy and Terms of Service when created */}
          {/* <Link href="/privacy-policy" className="font-body text-sm text-muted-foreground hover:text-accent transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms-of-service" className="font-body text-sm text-muted-foreground hover:text-accent transition-colors">
            Terms of Service
          </Link> */}
        </div>
        <p className="font-body text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Chez Shiobara B&B. All rights reserved.
        </p>
        <p className="font-body text-xs text-muted-foreground mt-1">
          16-7 Karasawa, Minami-ku, Yokohama, Kanagawa 232-0034, Japan
        </p>
      </div>
    </footer>
  );
}
