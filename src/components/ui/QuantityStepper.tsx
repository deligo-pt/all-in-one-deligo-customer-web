"use client";

import { cn } from "@/lib/cn";
import { Button } from "./Button";
import { Icon } from "./Icon";

/**
 * The − n + control on a cart line.
 *
 * Both buttons carry an accessible name from the caller, because the previous
 * project shipped them as unlabelled round glyphs and a screen reader announced
 * two anonymous buttons either side of a number. The number itself is a live
 * region, so changing it is heard without moving focus.
 *
 * Disabling `decrease` at the minimum is the caller's decision, not this
 * component's: a cart line at quantity 1 removes rather than decrements, and
 * only the caller knows that.
 */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max,
  decreaseLabel,
  increaseLabel,
  quantityLabel,
  disabled,
  className,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  decreaseLabel: string;
  increaseLabel: string;
  /** Accessible name for the number itself — "Quantity". */
  quantityLabel: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      <Button
        variant="outline"
        size="icon-sm"
        aria-label={decreaseLabel}
        disabled={disabled || value <= min}
        onClick={() => onChange(value - 1)}
      >
        <Icon name="minus" className="size-4" />
      </Button>
      <span
        aria-label={quantityLabel}
        aria-live="polite"
        className="text-14 text-ink w-6 text-center font-semibold"
      >
        {value}
      </span>
      <Button
        variant="outline"
        size="icon-sm"
        aria-label={increaseLabel}
        disabled={disabled || (max !== undefined && value >= max)}
        onClick={() => onChange(value + 1)}
      >
        <Icon name="plus" className="size-4" />
      </Button>
    </div>
  );
}
