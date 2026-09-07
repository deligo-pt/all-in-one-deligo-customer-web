"use client";

import { Switch as RadixSwitch } from "radix-ui";
import { cn } from "@/lib/cn";

/**
 * An on/off control that takes effect immediately — notifications, location
 * services. If the change needs saving afterwards it is a checkbox, and the
 * difference matters to anyone who cannot see the page: a switch announces
 * "on"/"off", a checkbox announces "checked".
 */
export function Switch({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixSwitch.Root>) {
  return (
    <RadixSwitch.Root
      className={cn(
        "bg-line relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
        "data-[state=checked]:bg-brand",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <RadixSwitch.Thumb
        className={cn(
          "bg-surface pointer-events-none block size-5 rounded-full shadow-xs transition-transform",
          "translate-x-0.5 data-[state=checked]:translate-x-5.5",
          "rtl:-translate-x-0.5 rtl:data-[state=checked]:-translate-x-5.5",
        )}
      />
    </RadixSwitch.Root>
  );
}
