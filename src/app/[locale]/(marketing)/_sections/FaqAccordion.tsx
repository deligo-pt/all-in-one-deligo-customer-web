"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";

/**
 * The FAQ list.
 *
 * `collapsible` and single: the design shows one answer open at a time, and a
 * customer who opens the fourth question should not have to close the first.
 *
 * The questions arrive as finished strings from the server section, so this
 * carries no dictionary — it is the interactive shell around content that was
 * already rendered in the right language.
 */
export function FaqAccordion({
  items,
}: {
  items: ReadonlyArray<{ question: string; answer: string }>;
}) {
  return (
    <Accordion type="single" collapsible className="w-full">
      {items.map((item) => (
        <AccordionItem key={item.question} value={item.question}>
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionContent>{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
