"use client";

import { RadioGroup } from "radix-ui";
import { cn } from "@/lib/cn";

/**
 * A radio group, exported as a group rather than as a single radio — because a
 * lone radio is not a thing. Arrow keys move between options and only one is in
 * the tab order, which is the behaviour a set of `<input type=radio>` has and a
 * set of styled divs does not.
 */
export function RadioGroupRoot({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadioGroup.Root>) {
  return (
    <RadioGroup.Root className={cn("flex flex-col gap-3", className)} {...props} />
  );
}

export function Radio({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadioGroup.Item>) {
  return (
    <RadioGroup.Item
      className={cn(
        "border-line flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
        "data-[state=checked]:border-brand",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <RadioGroup.Indicator className="bg-brand size-2.5 rounded-full" />
    </RadioGroup.Item>
  );
}
