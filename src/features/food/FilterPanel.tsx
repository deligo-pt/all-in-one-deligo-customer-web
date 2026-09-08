"use client";

import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Radio, RadioGroupRoot } from "@/components/ui/Radio";
import { useId } from "react";
import { cn } from "@/lib/cn";
import type { DeliveryOption, FoodFilters, SortOption } from "./types";

/**
 * The listing's filter rail.
 *
 * Measured: 312 wide, 16px radius, `surface-subtle` on a `brand-soft` border,
 * 24px inside, 48px between groups; each group is a 16/600 uppercase heading
 * over 12px-spaced rows.
 *
 * ## Everything here is a real control
 *
 * Sort is a `RadioGroup` because exactly one applies; Delivery is a pair of
 * toggle chips; Deals, Dietary and Cuisine are checkboxes because several can.
 * The design draws all five as bare shapes, and a shape is not a control — the
 * keyboard contracts come from the Phase 3 primitives so that none of the five
 * has to be argued about again.
 *
 * ## Nothing here filters anything yet
 *
 * State lives in the page and is sent to the catalogue in Phase 16, where the
 * API does the filtering. It is a real form now so that the day it is wired
 * there is no second round of state bugs — and "Reset All" already works,
 * because it is the one control whose behaviour needs no backend at all.
 */
const SORT_OPTIONS = [
  "recommended",
  "best-value",
  "price-asc",
  "price-desc",
] as const satisfies readonly SortOption[];

const DELIVERY_OPTIONS = [
  "instant",
  "pickup",
] as const satisfies readonly DeliveryOption[];

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-16 text-ink font-semibold uppercase">{title}</h3>
      {children}
    </section>
  );
}

export type FilterCopy = {
  title: string;
  reset: string;
  sort: string;
  delivery: string;
  deals: string;
  dietary: string;
  cuisine: string;
  /**
   * Records rather than functions.
   *
   * These objects are handed from a Server Component to a client one, and a
   * function cannot cross that boundary — the build fails at export with
   * "Functions cannot be passed directly to Client Components", which is
   * exactly what it did. A `Record` keyed by the option type is also stricter:
   * adding a sort option is a compile error here rather than a lookup that
   * silently returns the key.
   */
  sortOption: Record<SortOption, string>;
  deliveryOption: Record<DeliveryOption, string>;
};

export function FilterPanel({
  value,
  onChange,
  copy,
  deals,
  dietary,
  cuisines,
  className,
}: {
  value: FoodFilters;
  onChange: (next: FoodFilters) => void;
  copy: FilterCopy;
  /** The facets the catalogue offers. Empty until Phase 16 supplies them. */
  deals: readonly { id: string; label: string }[];
  dietary: readonly { id: string; label: string }[];
  cuisines: readonly { id: string; label: string }[];
  className?: string;
}) {
  const groupId = useId();

  const toggle = <K extends "deals" | "dietary" | "cuisines" | "delivery">(
    key: K,
    id: FoodFilters[K][number],
  ) => {
    const current = value[key] as readonly string[];
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id];
    onChange({ ...value, [key]: next });
  };

  return (
    <aside
      className={cn(
        "border-brand-soft bg-surface-subtle rounded-16 flex flex-col gap-12 border p-6",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-20 text-ink font-semibold">{copy.title}</h2>
        <Button variant="link" onClick={() => onChange({ ...value, ...RESET })}>
          {copy.reset}
        </Button>
      </div>

      <Group title={copy.sort}>
        <RadioGroupRoot
          value={value.sort}
          onValueChange={(next) => onChange({ ...value, sort: next as SortOption })}
        >
          {SORT_OPTIONS.map((option) => (
            <div key={option} className="flex items-center gap-2">
              {/* `htmlFor` rather than wrapping: Radix renders the radio as a
                  `<button role="radio">`, and a button inside a label does not
                  inherit the label's click the way an input does. */}
              <Radio id={`${groupId}-sort-${option}`} value={option} />
              <label
                htmlFor={`${groupId}-sort-${option}`}
                className="text-16 text-ink cursor-pointer"
              >
                {copy.sortOption[option]}
              </label>
            </div>
          ))}
        </RadioGroupRoot>
      </Group>

      <Group title={copy.delivery}>
        <div className="flex flex-wrap gap-4">
          {DELIVERY_OPTIONS.map((option) => {
            const active = value.delivery.includes(option);
            return (
              <Button
                key={option}
                variant="outline"
                shape="pill"
                aria-pressed={active}
                onClick={() => toggle("delivery", option)}
                className={cn(
                  "border-brand h-10 px-6",
                  active ? "bg-brand text-ink-inverse" : "text-brand",
                )}
              >
                {copy.deliveryOption[option]}
              </Button>
            );
          })}
        </div>
      </Group>

      {(
        [
          [copy.deals, "deals", deals],
          [copy.dietary, "dietary", dietary],
          [copy.cuisine, "cuisines", cuisines],
        ] as const
      ).map(([title, key, facets]) => (
        <Group key={key} title={title}>
          <div className="flex flex-col gap-3">
            {facets.map((facet) => (
              <div key={facet.id} className="flex items-center gap-2">
                <Checkbox
                  id={`${groupId}-${key}-${facet.id}`}
                  checked={(value[key] as readonly string[]).includes(facet.id)}
                  onCheckedChange={() => toggle(key, facet.id)}
                />
                <label
                  htmlFor={`${groupId}-${key}-${facet.id}`}
                  className="text-16 text-ink cursor-pointer"
                >
                  {facet.label}
                </label>
              </div>
            ))}
          </div>
        </Group>
      ))}
    </aside>
  );
}

/** Everything a reset clears. Written out rather than spreading a fresh
 *  `EMPTY_FILTERS`, so adding a facet to the type is a compile error here
 *  rather than a facet that silently survives "Reset All". */
const RESET = {
  sort: "recommended",
  delivery: [],
  deals: [],
  dietary: [],
  cuisines: [],
} as const satisfies FoodFilters;
