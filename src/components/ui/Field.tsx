"use client";

import { useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Label, control, help text and error — wired together rather than placed near
 * each other.
 *
 * The wiring is the whole component. A label that is not `htmlFor` its input is
 * decoration; an error message that is not referenced by `aria-describedby` is
 * invisible to the person most likely to need it. Both are easy to get right
 * once, here, and easy to forget on the fortieth form field of Phase 10.
 *
 * The child is a function so the ids can be handed to whatever control it is —
 * this component does not need to know whether it wraps an input, a select or
 * a group of radios.
 */
export function Field({
  label,
  help,
  error,
  required,
  className,
  children,
}: {
  label: ReactNode;
  help?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  className?: string;
  children: (ids: {
    id: string;
    "aria-describedby": string | undefined;
    "aria-invalid": true | undefined;
  }) => ReactNode;
}) {
  const id = useId();
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;
  const describedBy =
    [error ? errorId : null, help ? helpId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-14 text-ink font-medium">
        {label}
        {/* The asterisk is decoration; `aria-required` on the control is the
            statement. A screen reader announcing "star" helps nobody. */}
        {required ? (
          <span aria-hidden className="text-danger ms-1">
            *
          </span>
        ) : null}
      </label>

      {children({
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
      })}

      {help && !error ? (
        <p id={helpId} className="text-12 text-ink-muted">
          {help}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-12 text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
