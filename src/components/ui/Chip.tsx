import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

/**
 * A filter that can be pressed: "Food (3)", "Groceries (2)".
 *
 * Measured at 36px tall, fully round, a 1px `line` border, 24px of inline
 * padding, 14/500 — the row above the vendor list.
 *
 * **Corrected in Phase 9.** The unselected shape came from the cart frame's
 * own filter row; the *selected* one was inferred, and it was inferred wrong —
 * it was a tinted outline, and the design fills it. `All (7)` in the cart is
 * solid `brand` with inverse text against outlined neighbours, which is the
 * contrast the row needs to say which filter is on at a glance.
 *
 * It is a real `<button>` with `aria-pressed`, not a styled `div`. A filter
 * that cannot be reached by keyboard is a filter half the people who need
 * filters cannot use.
 */
export function Chip({
  className,
  selected = false,
  ...props
}: ComponentPropsWithoutRef<"button"> & { selected?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "text-14 inline-flex h-9 items-center gap-2 rounded-full border px-6 font-medium transition-colors",
        selected
          ? "border-brand bg-brand text-ink-inverse hover:bg-brand-strong"
          : "border-line text-ink hover:bg-surface-muted bg-transparent",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
