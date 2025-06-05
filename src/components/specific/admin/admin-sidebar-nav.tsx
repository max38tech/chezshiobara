
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  CalendarDays,
  Settings,
  Images,
  BookOpenText,
  ListChecks,
  Lightbulb,
  DollarSign,
  CreditCard,
  PencilLine,
  ShieldCheck, // Added for Commerce Disclosure
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  href?: string;
  label: string;
  icon: LucideIcon;
  isGroup?: boolean;
  subItems?: NavItem[];
  isExternal?: boolean;
}

const adminNavItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/bookings-calendar", label: "Bookings Calendar", icon: CalendarDays },
  {
    label: "Content Management",
    icon: PencilLine,
    isGroup: true,
    subItems: [
      { href: "/admin/content/gallery", label: "Welcome Gallery", icon: Images },
      { href: "/admin/content/rules", label: "House Rules", icon: ListChecks },
      { href: "/admin/content/house-guide", label: "House Guide", icon: BookOpenText },
      { href: "/admin/content/local-tips", label: "Local Tips", icon: Lightbulb },
      { href: "/admin/content/commerce-disclosure", label: "Commerce Disclosure", icon: ShieldCheck },
    ],
  },
  {
    label: "Settings",
    icon: Settings,
    isGroup: true,
    subItems: [
      { href: "/admin/settings/pricing", label: "Pricing", icon: DollarSign },
      { href: "/admin/settings/payment-methods", label: "Payment Methods", icon: CreditCard },
    ],
  },
];

export function AdminSidebarNav() {
  const pathname = usePathname();

  const renderNavItem = (item: NavItem, isSubItem = false) => {
    const Icon = item.icon;
    const isActive = item.href ? pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href)) : false;

    if (item.href) {
      const MenuButtonComponent = isSubItem ? SidebarMenuSubButton : SidebarMenuButton;
      const targetProps = item.isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {};
      
      return (
        <SidebarMenuItem key={item.href}>
          <MenuButtonComponent
            asChild={true} 
            className={cn(isActive && (isSubItem ? "bg-sidebar-accent text-sidebar-accent-foreground" : "bg-primary text-primary-foreground"))}
            isActive={isActive}
            size={isSubItem ? "sm" : "default"}
          >
            <Link href={item.href} {...targetProps}>
              <Icon className={cn("mr-2 h-4 w-4", isActive && !isSubItem ? "text-primary-foreground" : "text-primary" )} />
              <span>{item.label}</span>
            </Link>
          </MenuButtonComponent>
        </SidebarMenuItem>
      );
    }

    if (item.isGroup && item.subItems) {
      // Check if any sub-item is active to consider the group "active" for styling or expansion
      const isGroupActive = item.subItems.some(sub => sub.href && (pathname === sub.href || pathname.startsWith(sub.href)));
      return (
        <SidebarMenuItem key={item.label} className="mt-2">
           <SidebarGroupLabel className="px-2 pt-2 text-xs uppercase text-muted-foreground group-data-[collapsible=icon]:hidden">
            <Icon className="mr-2 h-4 w-4 inline" /> 
            <span className="ml-1">{item.label}</span> 
          </SidebarGroupLabel>
          <SidebarMenuSub>
            {item.subItems.map(subItem => renderNavItem(subItem, true))}
          </SidebarMenuSub>
        </SidebarMenuItem>
      );
    }
    return null;
  };

  return (
    <SidebarMenu className="p-2">
      {adminNavItems.map(item => renderNavItem(item))}
    </SidebarMenu>
  );
}

