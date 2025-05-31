import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface PageTitleProps {
  children: ReactNode;
  className?: string;
}

export function PageTitle({ children, className }: PageTitleProps) {
  return (
    <h1 className={cn("font-headline text-4xl sm:text-5xl lg:text-6xl text-foreground mb-8 sm:mb-12 text-center leading-tight", className)}>
      {children}
    </h1>
  );
}
