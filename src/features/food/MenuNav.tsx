"use client";

import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import type { MenuCategory } from "./types";

/**
 * The bar that sits above a vendor's menu: an item search on one side, the
 * category names on the other.
 *
 * Measured: 78 tall over a `line` rule; the search 316×53 at 8px radius; the
 * names at 16/600 on 24px gaps, the active one underlined by a 2px brand bar.
 *
 * ## Anchors, not tabs
 *
 * Every category is rendered on the page below, one after another — the design
 * shows Popular, Burger, Meal, Sides, Drinks and Dessert all stacked. So these
 * are links to headings, and the underline follows the heading nearest the top
 * of the viewport. Tabs would hide five sections out of six and break the
 * scroll the design is built around.
 *
 * The search filters the sections in place rather than navigating. It is
 * client-side over the menu already on the page, which is what makes it
 * instant and what makes it correct without an endpoint: the whole menu is
 * here.
 */
export function MenuNav({
  categories,
  activeId,
  query,
  onQueryChange,
  searchLabel,
  searchPlaceholder,
  navLabel,
}: {
  categories: readonly MenuCategory[];
  activeId?: string;
  query: string;
  onQueryChange: (next: string) => void;
  searchLabel: string;
  searchPlaceholder: string;
  navLabel: string;
}) {
  return (
    <div className="border-line bg-surface sticky top-[6.875rem] z-20 flex flex-wrap items-center gap-12 border-b py-4">
      <Input
        type="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        aria-label={searchLabel}
        placeholder={searchPlaceholder}
        startIcon={<Icon name="search" className="size-4" />}
        className="rounded-8 text-14 h-13 w-full sm:w-80"
      />

      <nav aria-label={navLabel}>
        <ul className="flex flex-wrap items-center gap-6">
          {categories.map((category) => {
            const active = category.id === activeId;
            return (
              <li key={category.id}>
                <a
                  href={`#menu-${category.id}`}
                  aria-current={active ? "location" : undefined}
                  className={cn(
                    "text-16 flex flex-col items-center gap-1 font-semibold transition-colors",
                    active ? "text-brand" : "text-ink hover:text-brand",
                  )}
                >
                  {category.name}
                  <span
                    aria-hidden
                    className={cn(
                      "rounded-4 h-0.5 w-full",
                      active ? "bg-brand" : "bg-transparent",
                    )}
                  />
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
