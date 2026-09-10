"use client";

import { useTranslations } from "next-intl";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function FaqList() {
  const t = useTranslations("faq");
  const items = t.raw("items") as { q: string; a: string }[];

  return (
    <Accordion type="single" collapsible className="w-full">
      {items.map((item, index) => (
        <AccordionItem key={item.q} value={`item-${index}`} className="border-white/15">
          <AccordionTrigger className="py-5 text-left text-lg font-medium text-white hover:no-underline">
            {item.q}
          </AccordionTrigger>
          <AccordionContent className="max-w-[65ch] pb-5 text-base leading-relaxed text-white/65">
            {item.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
