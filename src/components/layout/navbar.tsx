
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Home, Users, CalendarDays, ListChecks, BookOpenText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { AppLogo } from "./app-logo";

const navItems = [
  { href: "/", label: "Welcome", icon: Home },
  { href: "/who-we-are", label: "Who We Are", icon: Users },
  { href: "/booking", label: "Book Your Stay", icon: CalendarDays },
  { href: "/rules", label: "House Rules", icon: ListChecks },
  { href: "/house-guide", label: "House Guide", icon: BookOpenText },
  { href: "/concierge", label: "AI Concierge", icon: Sparkles },
];

export function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const NavLink = ({ href, label, icon: Icon }: typeof navItems[0] & { isMobile?: boolean }) => (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
        pathname === href
          ? "bg-accent text-accent-foreground"
          : "text-foreground hover:bg-accent/50 hover:text-accent-foreground",
        isMobileMenuOpen && "text-lg w-full justify-start" 
      )}
      onClick={() => setIsMobileMenuOpen(false)}
    >
      <Icon className="h-5 w-5 text-primary" />
      <span className="font-headline">{label}</span>
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <AppLogo />
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6 text-primary" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-xs bg-background p-6">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex justify-between items-center mb-6">
                <AppLogo />
                <SheetClose asChild>
                  <Button variant="ghost" size="icon">
                    <X className="h-6 w-6 text-primary" />
                    <span className="sr-only">Close menu</span>
                  </Button>
                </SheetClose>
              </div>
              <div className="flex flex-col space-y-3">
                {navItems.map((item) => (
                  <NavLink key={item.href} {...item} isMobile={true} />
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
