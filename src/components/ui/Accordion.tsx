"use client";

import { Accordion as RadixAccordion } from "radix-ui";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

/**
 * The FAQ list on the landing page and in the help centre.
 *
 * The trigger is a button inside a heading, which is what lets a screen-reader
 * user navigate the questions by heading and expand the one they want. A
 * `<div onClick>` with a chevron is the same picture and none of that.
 */
export const Accordion = RadixAccordion.Root;

export function AccordionItem({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixAccordion.Item>) {
  return (
    <RadixAccordion.Item
      className={cn("border-line-subtle border-b", className)}
      {...props}
    />
  );
}

export function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixAccordion.Trigger>) {
  return (
    <RadixAccordion.Header className="flex">
      <RadixAccordion.Trigger
        className={cn(
          "text-16 text-ink flex flex-1 items-center justify-between gap-4 py-5 text-start font-medium",
          "hover:text-brand transition-colors",
          "[&[data-state=open]>svg]:rotate-180",
          className,
        )}
        {...props}
      >
        {children}
        <Icon name="chevron-down" className="text-ink-muted transition-transform" />
      </RadixAccordion.Trigger>
    </RadixAccordion.Header>
  );
}

export function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixAccordion.Content>) {
  return (
    <RadixAccordion.Content
      className={cn("text-14 text-ink-muted leading-relaxed", className)}
      {...props}
    >
      <div className="pb-5">{children}</div>
    </RadixAccordion.Content>
  );
}
