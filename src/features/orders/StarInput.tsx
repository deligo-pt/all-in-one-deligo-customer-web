"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";

/**
 * Five stars you can press.
 *
 * `components/ui/Rating` **displays** a score — it takes a number and draws it,
 * and has no handler. This takes one. Two different controls, and merging them
 * would give the display component an interactive mode nobody renders.
 *
 * It lives in the feature because the review modal is its only caller. On a
 * second caller it moves to `components/ui` and into the gallery; until then a
 * primitive with one consumer is a primitive nobody has generalised yet.
 *
 * Every star carries its own name. Five identical icon buttons announced as
 * nothing is what the other project shipped for a year.
 */
export function StarInput({
  value,
  onChange,
  label,
  starLabels,
}: {
  value: number;
  onChange: (next: number) => void;
  /** What is being scored, for the group. */
  label: string;
  /** Five finished labels — "Rate 1 out of 5" … "Rate 5 out of 5" — resolved
   *  on the server. A pattern plus a `.replace()` here would put message
   *  interpolation in the browser, which Phase 9 settled belongs with the
   *  translator. */
  starLabels: readonly string[];
}) {
  const [hover, setHover] = useState<number | null>(null);

  return (
    <div className="flex gap-2" role="group" aria-label={label}>
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= (hover ?? value);
        return (
          <button
            key={star}
            type="button"
            aria-label={starLabels[star - 1]}
            aria-pressed={star === value}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(null)}
            className="transition-colors"
          >
            <Icon
              name="star"
              className={["size-7", active ? "text-rating" : "text-line"].join(" ")}
            />
          </button>
        );
      })}
    </div>
  );
}
