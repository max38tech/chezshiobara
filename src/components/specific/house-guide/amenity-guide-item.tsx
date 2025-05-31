import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { ReactNode } from "react";

interface AmenityGuideItemProps {
  title: string;
  children: ReactNode;
  value: string;
}

export function AmenityGuideItem({ title, children, value }: AmenityGuideItemProps) {
  return (
    <AccordionItem value={value} className="border-b border-border last:border-b-0">
      <AccordionTrigger className="py-4 px-2 text-left hover:no-underline">
        <span className="font-headline text-xl text-foreground">{title}</span>
      </AccordionTrigger>
      <AccordionContent className="pb-4 px-2">
        <div className="font-body text-base text-foreground space-y-3 leading-relaxed">
          {children}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
