"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Home, Users, CalendarDays, BookOpenText, ListChecks, Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { AppLogo } from "./app-logo";

const navItems = [
	{ href: "/", label: "Welcome", icon: Home },
	{ href: "/who-we-are", label: "Who We Are", icon: Users },
	{ href: "/booking", label: "Book Your Stay", icon: CalendarDays },
	{ href: "/house-guide", label: "House Guide", icon: BookOpenText },
	{ href: "/rules", label: "House Rules", icon: ListChecks },
	{
		label: "Local Tips",
		icon: Sparkles,
		dropdown: [
			{ href: "/local-tips", label: "All Local Tips" },
			{ href: "/local-tips/residentdatasim", label: "Resident Data SIM Guide" }, // Renamed and updated route
			{ href: "/local-tips/touristdatasim", label: "Tourist Data SIM Guide" }, // Added new tourist SIM guide
		],
	},
	{ href: "/contact", label: "Contact Us", icon: Mail },
];

export function Navbar() {
	const pathname = usePathname();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [openDropdown, setOpenDropdown] = useState<string | null>(null);

	const NavLink = ({ href, label, icon: Icon }: { href: string; label: string; icon: any; isMobile?: boolean }) => (
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

	// Desktop dropdown for Local Tips
	const DesktopDropdown = ({ label, icon: Icon, dropdown }: any) => (
		<div className="relative group">
			<button
				className={cn(
					"flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-foreground hover:bg-accent/50 hover:text-accent-foreground",
					"focus:outline-none"
				)}
			>
				<Icon className="h-5 w-5 text-primary" />
				<span className="font-headline">{label}</span>
				<svg
					className="ml-1 w-3 h-3"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					viewBox="0 0 24 24"
				>
					<path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
				</svg>
			</button>
			<div className="absolute left-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-20">
				{dropdown.map((item: any) => (
					<Link
						key={item.href}
						href={item.href}
						className={cn(
							"block px-4 py-2 text-sm text-gray-700 hover:bg-accent/30 hover:text-accent-foreground",
							pathname === item.href && "bg-accent/40 text-accent-foreground"
						)}
						onClick={() => setIsMobileMenuOpen(false)}
					>
						{item.label}
					</Link>
				))}
			</div>
		</div>
	);

	// Mobile dropdown for Local Tips
	const MobileDropdown = ({ label, icon: Icon, dropdown }: any) => (
		<div>
			<button
				className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-lg font-medium text-foreground hover:bg-accent/50 hover:text-accent-foreground"
				onClick={() => setOpenDropdown(openDropdown === label ? null : label)}
				type="button"
			>
				<Icon className="h-5 w-5 text-primary" />
				<span className="font-headline">{label}</span>
				<svg
					className="ml-auto w-4 h-4"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					viewBox="0 0 24 24"
				>
					<path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
				</svg>
			</button>
			{openDropdown === label && (
				<div className="pl-8">
					{dropdown.map((item: any) => (
						<Link
							key={item.href}
							href={item.href}
							className={cn(
								"block px-2 py-2 text-base text-gray-700 hover:bg-accent/30 hover:text-accent-foreground",
								pathname === item.href && "bg-accent/40 text-accent-foreground"
							)}
							onClick={() => setIsMobileMenuOpen(false)}
						>
							{item.label}
						</Link>
					))}
				</div>
			)}
		</div>
	);

	return (
		<header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto flex h-16 items-center justify-between px-4">
				<AppLogo />
				<nav className="hidden md:flex items-center space-x-1">
					{navItems.map((item) =>
						item.dropdown ? (
							<DesktopDropdown key={item.label} {...item} />
						) : (
							<NavLink key={item.href} {...item} />
						)
					)}
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
								{navItems.map((item) =>
									item.dropdown ? (
										<MobileDropdown key={item.label} {...item} />
									) : (
										<NavLink key={item.href} {...item} isMobile={true} />
									)
								)}
							</div>
						</SheetContent>
					</Sheet>
				</div>
			</div>
		</header>
	);
}
