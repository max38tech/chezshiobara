import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface PageContentWrapperProps {
  children: ReactNode;
  className?: string;
}

export function PageContentWrapper({ children, className }: PageContentWrapperProps) {
  return (
    <div 
      className={cn(
        "container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-grow animate-in fade-in-0 duration-500 ease-out", 
        className
      )}
    >
      {children}
    </div>
  );
}
