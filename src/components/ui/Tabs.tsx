"use client";

import { Tabs as RadixTabs } from "radix-ui";
import { cn } from "@/lib/cn";

/**
 * The `All / Food / Groceries / Electronics` row from the cart, and the service
 * picker on the landing page.
 *
 * Arrow keys move between tabs and only the active one is tabbable — the roving
 * tab index that Radix implements and that hand-rolled tab bars almost never
 * do. The underline is on the trigger rather than a sliding indicator element,
 * so it cannot desynchronise from the selection.
 */
export const Tabs = RadixTabs.Root;

export function TabsList({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixTabs.List>) {
  return (
    <RadixTabs.List
      className={cn("border-line-subtle flex items-center gap-6 border-b", className)}
      {...props}
    />
  );
}

export function TabsTrigger({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixTabs.Trigger>) {
  return (
    <RadixTabs.Trigger
      className={cn(
        "text-14 text-ink-muted -mb-px border-b-2 border-transparent pb-3 font-medium transition-colors",
        "hover:text-ink",
        "data-[state=active]:border-brand data-[state=active]:text-brand",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixTabs.Content>) {
  return <RadixTabs.Content className={cn("pt-6", className)} {...props} />;
}
