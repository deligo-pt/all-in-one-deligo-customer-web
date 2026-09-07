import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

/**
 * A non-interactive status mark: "20% OFF", "Closed", "New".
 *
 * If it can be clicked or dismissed it is a `Chip`, not a badge. The two look
 * similar in the design and behave nothing alike, and merging them is how a
 * `<span>` ends up with an onClick and no keyboard path.
 */
const badge = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-12 font-medium whitespace-nowrap",
  {
    variants: {
      tone: {
        brand: "bg-brand-tint text-brand",
        neutral: "bg-surface-muted text-ink-muted",
        success: "bg-success/12 text-success",
        warning: "bg-warning/15 text-ink",
        danger: "bg-danger/12 text-danger",
        solid: "bg-brand text-ink-inverse",
      },
    },
    defaultVariants: { tone: "brand" },
  },
);

export function Badge({
  className,
  tone,
  ...props
}: ComponentPropsWithoutRef<"span"> & VariantProps<typeof badge>) {
  return <span className={cn(badge({ tone }), className)} {...props} />;
}
