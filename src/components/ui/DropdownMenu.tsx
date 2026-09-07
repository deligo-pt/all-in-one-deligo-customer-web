"use client";

import { DropdownMenu as RadixDropdownMenu } from "radix-ui";
import { cn } from "@/lib/cn";

/**
 * The account menu in the header, and the row actions on an order.
 *
 * A menu is not a select: it fires actions rather than choosing a value, and it
 * is announced as a menu. Using one for a form value is the most common misuse
 * of this component and produces a control nobody can submit.
 */
export const DropdownMenu = RadixDropdownMenu.Root;
export const DropdownMenuTrigger = RadixDropdownMenu.Trigger;

export function DropdownMenuContent({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.Content>) {
  return (
    <RadixDropdownMenu.Portal>
      <RadixDropdownMenu.Content
        sideOffset={6}
        className={cn(
          "bg-surface border-line-subtle rounded-12 z-50 min-w-48 border p-1 shadow-md",
          "data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out",
          className,
        )}
        {...props}
      />
    </RadixDropdownMenu.Portal>
  );
}

export function DropdownMenuItem({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.Item>) {
  return (
    <RadixDropdownMenu.Item
      className={cn(
        "text-14 text-ink rounded-8 flex cursor-pointer items-center gap-2 px-3 py-2.5",
        // No `outline-none` here. Radix moves DOM focus to the highlighted
        // item, so the app's one focus ring applies — and the ring plus the
        // highlight is more legible than the highlight alone, not less.
        "data-[highlighted]:bg-surface-muted",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.Separator>) {
  return (
    <RadixDropdownMenu.Separator
      className={cn("bg-line-subtle -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}
