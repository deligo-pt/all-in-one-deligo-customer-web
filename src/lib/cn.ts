/**
 * Class merging that understands *this* design system.
 *
 * `cn("text-14 text-ink", "text-16")` has to keep `text-ink` and drop
 * `text-14`. Out of the box `tailwind-merge` cannot do that: its font-size
 * group knows `text-xs`/`text-sm`/`text-base`, and Phase 1 deleted those in
 * favour of `text-14`. Anything it does not recognise as a size falls through
 * to its colour group, so `text-14` and `text-ink` would look like the same
 * property and the merge would silently discard one of them — usually the size,
 * usually on the one component where it mattered.
 *
 * So the scales are declared here as well as in `globals.css`. That is a real
 * duplication and it is the reason `verify:design` compares the two lists: a
 * token added to the stylesheet and forgotten here does not fail anything at
 * build time, it just merges wrong, occasionally, at runtime.
 */
import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/** Every `--color-*` role in globals.css. */
const COLOURS = [
  "brand-tint",
  "brand-pale",
  "brand-soft",
  "brand-mid",
  "brand",
  "brand-strong",
  "brand-deep",
  "focus",
  "surface",
  "surface-subtle",
  "surface-warm",
  "surface-muted",
  "ink",
  "ink-strong",
  "ink-muted",
  "ink-subtle",
  "ink-warm",
  "ink-inverse",
  "line",
  "line-subtle",
  "line-strong",
  "line-warm",
  "success",
  "warning",
  "rating",
  "danger",
] as const;

/** Every `--text-*` step. */
const TYPE = [
  "8",
  "10",
  "12",
  "13",
  "14",
  "16",
  "18",
  "20",
  "24",
  "32",
  "40",
  "48",
  "56",
] as const;

/** Every `--radius-*` step. */
const RADII = ["4", "8", "10", "12", "16", "20", "24", "32", "full"] as const;

/** Every `--shadow-*` step. */
const SHADOWS = ["xs", "sm", "md", "lg", "card", "brand", "focus"] as const;

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: [...TYPE] }],
      "text-color": [{ text: [...COLOURS] }],
      "bg-color": [{ bg: [...COLOURS] }],
      "border-color": [{ border: [...COLOURS] }],
      "ring-color": [{ ring: [...COLOURS] }],
      "outline-color": [{ outline: [...COLOURS] }],
      rounded: [{ rounded: [...RADII] }],
      shadow: [{ shadow: [...SHADOWS] }],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
