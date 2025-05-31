import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface SectionTitleProps {
  children: ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export function SectionTitle({ children, className, as: Component = 'h2' }: SectionTitleProps) {
  return (
    <Component className={cn("font-headline text-3xl sm:text-4xl text-foreground mb-6 sm:mb-8 leading-snug", className)}>
      {children}
    </Component>
  );
}
