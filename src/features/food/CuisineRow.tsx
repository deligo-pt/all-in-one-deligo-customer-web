"use client";

import { ImageSlot } from "@/components/shared/ImageSlot";
import { cn } from "@/lib/cn";
import type { Cuisine } from "./types";

/**
 * "Favorite Cuisines" — a row of 100px circles above the listing.
 *
 * Measured: 100 wide on 32px gaps, the image an 88px circle over a 12px gap
 * and a centred label.
 *
 * A row of buttons rather than links: choosing a cuisine narrows the listing
 * below rather than navigating, which is what the filter rail's own CUISINE
 * group does — this is the same filter, given the prominence the design gives
 * it. `aria-pressed` says which are on, because a pressed circle and an
 * unpressed one differ only by a ring.
 */
export function CuisineRow({
  cuisines,
  selected,
  onToggle,
  className,
}: {
  cuisines: readonly Cuisine[];
  selected: readonly string[];
  onToggle: (id: string) => void;
  className?: string;
}) {
  return (
    <ul className={cn("flex flex-wrap gap-8", className)}>
      {cuisines.map((cuisine) => {
        const active = selected.includes(cuisine.id);
        return (
          <li key={cuisine.id}>
            <button
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(cuisine.id)}
              className="flex w-24 flex-col items-center gap-3"
            >
              <ImageSlot
                src={cuisine.image}
                alt={cuisine.name}
                sizes="88px"
                className={cn(
                  "size-22 rounded-full transition-shadow",
                  active && "ring-brand ring-2 ring-offset-2",
                )}
              />
              <span
                className={cn(
                  "text-14 text-center",
                  active ? "text-brand font-medium" : "text-ink",
                )}
              >
                {cuisine.name}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
