"use client";

import { Tooltip as RadixTooltip } from "radix-ui";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Measured: 30px tall, 12px radius, 16/8 padding, dark surface, 12/500 text.
 *
 * A tooltip is supplementary by definition — it appears on hover and on
 * keyboard focus, and it never carries information that is only available
 * there. Anything a customer must read to complete a task belongs in the page.
 *
 * `Provider` is exported separately and mounted once near the root, so that
 * moving between tooltips does not replay the open delay each time.
 */
export const TooltipProvider = RadixTooltip.Provider;

export function Tooltip({
  label,
  children,
  side = "top",
  className,
}: {
  label: ReactNode;
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
}) {
  return (
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side={side}
          sideOffset={6}
          className={cn(
            "bg-ink-strong text-ink-inverse text-12 rounded-12 z-50 px-4 py-2 font-medium",
            "data-[state=delayed-open]:animate-fade-in data-[state=closed]:animate-fade-out",
            className,
          )}
        >
          {label}
          <RadixTooltip.Arrow className="fill-ink-strong" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
}
