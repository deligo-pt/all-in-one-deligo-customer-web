import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";

/**
 * Measured, not invented.
 *
 * 454 nodes named `Button` in the Figma page were clustered by fill, radius,
 * height, padding and text style. The clusters are the variants below, and the
 * numbers behind each are in Plan.md §8, Phase 3. Where the file disagreed with
 * itself — the same button drawn at four radii — the most frequent value won
 * and the rest are recorded as snapped.
 *
 * `radius-4` looks square for a button and is what the design does: 42 of the
 * 83 filled brand buttons use it, against 14 pills, 11 at 12 and 7 at 8. The
 * pills are a shape, not a size, so they are `shape="pill"`.
 *
 * Focus is not styled here. There is one `:focus-visible` outline for the whole
 * app in globals.css, and a component that overrides it is a component that has
 * decided its own focus ring is more important than the app's consistency.
 */
const button = cva(
  // Logical properties only — `ps`/`pe`, never `pl`/`pr`. Portuguese and
  // English both run left-to-right, so nothing here proves itself today; the
  // point is that the kit does not have to be re-audited the first time a
  // right-to-left language is added.
  "relative inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap transition-colors select-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-brand text-ink-inverse hover:bg-brand-strong active:bg-brand-deep",
        secondary: "bg-surface-muted text-ink hover:bg-line-subtle active:bg-line",
        outline:
          "border-line text-ink hover:bg-surface-muted active:bg-line-subtle border bg-transparent",
        ghost: "text-ink hover:bg-surface-muted active:bg-line-subtle bg-transparent",
        // The design draws these as plain pink text at 12/500 — "Show on map",
        // "Remove". Underlined on hover rather than always, which is what the
        // prototype's hover states show.
        link: "text-brand hover:text-brand-strong h-auto p-0 underline-offset-4 hover:underline",
        danger: "bg-danger text-ink-inverse hover:opacity-90 active:opacity-80",
      },
      size: {
        sm: "text-14 h-9 px-4",
        md: "text-14 h-11 px-6",
        lg: "text-16 h-14 px-8",
        // Square. 150 of the file's buttons are icon-only, 86 of them at 40px
        // and 56 at 32px, and 136 of the 150 are round.
        icon: "size-10",
        "icon-sm": "size-8",
      },
      shape: {
        square: "rounded-4",
        pill: "rounded-full",
      },
      block: { true: "w-full", false: "" },
    },
    compoundVariants: [
      // An icon button is round unless someone insists otherwise.
      { size: ["icon", "icon-sm"], shape: "square", class: "rounded-full" },
      // A link has no box, so it has no radius and no padding to round.
      { variant: "link", class: "rounded-none px-0" },
    ],
    defaultVariants: { variant: "primary", size: "md", shape: "square", block: false },
  },
);

export type ButtonProps = ComponentPropsWithoutRef<"button"> &
  VariantProps<typeof button> & {
    /** Render as the single child element instead of a `<button>` — a `Link`
     *  that should look like a button, without nesting an anchor in a button. */
    asChild?: boolean;
    /** Replaces the content with a spinner and blocks interaction. The label
     *  stays in the DOM for width and for assistive technology. */
    loading?: boolean;
    startIcon?: ReactNode;
    endIcon?: ReactNode;
  };

export function Button({
  className,
  variant,
  size,
  shape,
  block,
  asChild,
  loading = false,
  disabled,
  startIcon,
  endIcon,
  children,
  type,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot.Root : "button";

  return (
    <Component
      // A `<button>` inside a form submits it unless told otherwise, and that
      // default has caused more accidental submits than it has saved keystrokes.
      type={asChild ? undefined : (type ?? "button")}
      className={cn(button({ variant, size, shape, block }), className)}
      disabled={asChild ? undefined : disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {/* `asChild` hands the caller's element straight through: Slot clones a
          single child, so the spinner/label wrapper cannot be added around it.
          A link styled as a button has no loading state anyway — it navigates. */}
      {asChild ? (
        children
      ) : (
        <>
          {loading ? <Spinner className="absolute" /> : null}
          <span
            className={cn("inline-flex items-center gap-2", loading && "invisible")}
          >
            {startIcon}
            {children}
            {endIcon}
          </span>
        </>
      )}
    </Component>
  );
}
