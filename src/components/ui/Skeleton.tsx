import { cn } from "@/lib/cn";

/**
 * A loading placeholder.
 *
 * `aria-hidden` with the real state announced by the container's `aria-busy`:
 * a screen reader has nothing to gain from twelve grey rectangles. The pulse is
 * a CSS animation, so `prefers-reduced-motion` stops it without this component
 * knowing about the preference.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("bg-surface-muted animate-pulse rounded-8", className)}
    />
  );
}
