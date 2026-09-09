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
 *
 * ## Two shapes, because the design has two
 *
 * `plain` is three loose controls, which is what the dish modal draws. `pill`
 * is the cart line's: a `line-subtle` track with the buttons sitting inside
 * it, the decrease a white disc and the increase filled `brand`. That
 * asymmetry is deliberate in the file and worth keeping — adding is the
 * ordinary action and removing is not, and a customer aiming for the plus at a
 * glance should not have to read two identical circles first.
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
  variant = "plain",
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
  variant?: "plain" | "pill";
  className?: string;
}) {
  const pill = variant === "pill";

  return (
    <div
      className={cn(
        "inline-flex items-center",
        pill ? "bg-line-subtle gap-1 rounded-full p-1" : "gap-3",
        className,
      )}
    >
      <Button
        variant={pill ? "secondary" : "outline"}
        size="icon-sm"
        aria-label={decreaseLabel}
        disabled={disabled || value <= min}
        onClick={() => onChange(value - 1)}
        className={cn(pill && "bg-surface text-ink hover:bg-surface-muted")}
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
        variant={pill ? "primary" : "outline"}
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
