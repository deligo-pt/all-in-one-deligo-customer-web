"use client";

import { Checkbox as RadixCheckbox } from "radix-ui";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

/**
 * A real checkbox, not a styled div.
 *
 * Radix renders a hidden native input alongside the visual box, so the control
 * participates in forms, is announced with its checked state, and responds to
 * Space — none of which a `<div role="checkbox">` gets for free, and all of
 * which are what people notice is missing.
 *
 * Indeterminate is supported because "select all" needs it and the alternative
 * is a third boolean threaded through every list.
 */
export function Checkbox({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixCheckbox.Root>) {
  return (
    <RadixCheckbox.Root
      className={cn(
        "border-line rounded-4 flex size-5 shrink-0 items-center justify-center border transition-colors",
        "data-[state=checked]:border-brand data-[state=checked]:bg-brand",
        "data-[state=indeterminate]:border-brand data-[state=indeterminate]:bg-brand",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <RadixCheckbox.Indicator className="text-ink-inverse flex items-center justify-center">
        {props.checked === "indeterminate" ? (
          <Icon name="minus" className="size-3.5" />
        ) : (
          <Icon name="check" className="size-3.5" />
        )}
      </RadixCheckbox.Indicator>
    </RadixCheckbox.Root>
  );
}
