import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Measured: 60 of the design's inputs are 56px tall, 12px radius, 16px of
 * inline padding, 16/400 text — and 48px of leading padding when an icon sits
 * inside. Those are the numbers below.
 *
 * `invalid` is a prop rather than a `:invalid` selector because the browser's
 * idea of invalid and the backend's are different things, and the second is the
 * one customers actually hit. It sets `aria-invalid`, which is what assistive
 * technology reads; the ring is the visible half of the same statement.
 */
export type InputProps = Omit<ComponentPropsWithoutRef<"input">, "size"> & {
  invalid?: boolean;
  /** Rendered inside the field, at the start. Decorative — label the input. */
  startIcon?: ReactNode;
  endIcon?: ReactNode;
};

export function Input({
  className,
  invalid,
  startIcon,
  endIcon,
  ...props
}: InputProps) {
  const field = (
    <input
      className={cn(
        "text-16 text-ink placeholder:text-ink-muted h-14 w-full rounded-12 px-4",
        "bg-surface border-line border transition-colors",
        "disabled:bg-surface-muted disabled:text-ink-subtle disabled:cursor-not-allowed",
        invalid && "border-danger",
        startIcon && "ps-12",
        endIcon && "pe-12",
        className,
      )}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );

  if (!startIcon && !endIcon) return field;

  return (
    <div className="relative">
      {startIcon ? (
        <span className="text-ink-muted pointer-events-none absolute inset-y-0 start-4 flex items-center">
          {startIcon}
        </span>
      ) : null}
      {field}
      {endIcon ? (
        <span className="text-ink-muted absolute inset-y-0 end-4 flex items-center">
          {endIcon}
        </span>
      ) : null}
    </div>
  );
}

export function Textarea({
  className,
  invalid,
  ...props
}: Omit<ComponentPropsWithoutRef<"textarea">, "size"> & { invalid?: boolean }) {
  return (
    <textarea
      className={cn(
        "text-16 text-ink placeholder:text-ink-muted min-h-28 w-full rounded-12 p-4",
        "bg-surface border-line border transition-colors",
        "disabled:bg-surface-muted disabled:text-ink-subtle disabled:cursor-not-allowed",
        invalid && "border-danger",
        className,
      )}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}
