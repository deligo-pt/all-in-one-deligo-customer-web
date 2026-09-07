"use client";

import { Select as RadixSelect } from "radix-ui";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

/**
 * A select that can be styled without losing what a native `<select>` gives:
 * typeahead, Home/End, Escape, and a listbox that is announced as one.
 *
 * Sized to match `Input` — 56px tall, 12px radius — because a form row with a
 * 56px field next to a 40px select looks like a mistake, and is one.
 */
export const Select = RadixSelect.Root;
export const SelectValue = RadixSelect.Value;

export function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixSelect.Trigger>) {
  return (
    <RadixSelect.Trigger
      className={cn(
        "text-16 text-ink bg-surface border-line rounded-12 flex h-14 w-full items-center justify-between gap-2 border px-4",
        "data-[placeholder]:text-ink-muted transition-colors",
        "disabled:bg-surface-muted disabled:text-ink-subtle disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    >
      {children}
      <RadixSelect.Icon>
        <Icon name="chevron-down" className="text-ink-muted" />
      </RadixSelect.Icon>
    </RadixSelect.Trigger>
  );
}

export function SelectContent({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixSelect.Content>) {
  return (
    <RadixSelect.Portal>
      <RadixSelect.Content
        position="popper"
        sideOffset={4}
        className={cn(
          "bg-surface border-line-subtle rounded-12 z-50 overflow-hidden border shadow-md",
          "w-[var(--radix-select-trigger-width)] max-h-[var(--radix-select-content-available-height)]",
          "data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out",
          className,
        )}
        {...props}
      >
        <RadixSelect.Viewport className="p-1">{children}</RadixSelect.Viewport>
      </RadixSelect.Content>
    </RadixSelect.Portal>
  );
}

export function SelectItem({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixSelect.Item>) {
  return (
    <RadixSelect.Item
      className={cn(
        "text-14 text-ink rounded-8 relative flex cursor-pointer items-center gap-2 px-3 py-2.5",
        // No `outline-none` here. Radix moves DOM focus to the highlighted
        // item, so the app's one focus ring applies — and the ring plus the
        // highlight is more legible than the highlight alone, not less.
        "data-[highlighted]:bg-surface-muted",
        "data-[state=checked]:text-brand data-[state=checked]:font-medium",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
      <RadixSelect.ItemIndicator className="ms-auto">
        <Icon name="check" className="size-4" />
      </RadixSelect.ItemIndicator>
    </RadixSelect.Item>
  );
}
