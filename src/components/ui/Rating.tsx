import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

/**
 * A star rating, read-only.
 *
 * The value is rendered **exactly as the backend sends it** — no rounding to
 * halves, no recomputing from a review count. The stars are a picture of that
 * number and the number is what a person is told: the accessible name carries
 * the value and the stars are `aria-hidden`, so nobody hears "star star star".
 *
 * Partial stars are drawn by clipping a filled row over an empty one, which
 * keeps 4.3 looking like 4.3 rather than snapping to 4 or 4.5.
 */
export function Rating({
  value,
  max = 5,
  label,
  className,
}: {
  value: number;
  max?: number;
  /** The accessible name, already formatted and translated — "4.3 of 5". */
  label: string;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(value, max));
  const percent = (clamped / max) * 100;

  return (
    <span
      role="img"
      aria-label={label}
      className={cn("relative inline-flex", className)}
    >
      <span aria-hidden className="text-line flex">
        {Array.from({ length: max }, (_, i) => (
          <Icon key={i} name="star" className="size-4" />
        ))}
      </span>
      <span
        aria-hidden
        className="text-rating absolute inset-0 flex overflow-hidden"
        style={{ inlineSize: `${percent}%` }}
      >
        {Array.from({ length: max }, (_, i) => (
          <Icon key={i} name="star" className="size-4" />
        ))}
      </span>
    </span>
  );
}
