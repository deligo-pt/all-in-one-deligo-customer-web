import { cn } from "@/lib/cn";

/**
 * The in-flight indicator, used by `Button` and anything that waits.
 *
 * It is `aria-hidden`: a spinner is a picture of waiting, and the waiting
 * itself is announced by the control that owns it (`aria-busy`, or a live
 * region). Announcing "loading" from two places at once is how a screen reader
 * ends up talking over itself.
 *
 * The rotation is a CSS animation, so the reduced-motion block in globals.css
 * stops it without this component knowing anything about that preference.
 */
export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("size-4 animate-spin", className)}
      aria-hidden
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        opacity="0.25"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
