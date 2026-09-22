"use client";

import { useEffect, useRef } from "react";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import { PHONE_STRIP } from "@/lib/phoneSlider";

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
  /** Only the anchor and the label — a grocery aisle is as good as a menu section. */
  categories: readonly { id: string; name: string }[];
  activeId?: string;
  query: string;
  onQueryChange: (next: string) => void;
  searchLabel: string;
  searchPlaceholder: string;
  navLabel: string;
}) {
  // On a phone the strip scrolls sideways, so the category the reader has
  // scrolled into can be off its edge. Bring it into view — by moving the
  // strip only; `scrollIntoView` could move the page as well.
  const strip = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const list = strip.current;
    const item = list?.querySelector<HTMLElement>("[data-active]");
    if (!list || !item || list.scrollWidth <= list.clientWidth) return;
    const start = item.offsetLeft - list.offsetLeft;
    const end = start + item.offsetWidth;
    if (start < list.scrollLeft || end > list.scrollLeft + list.clientWidth) {
      list.scrollTo({ left: Math.max(0, start - 16), behavior: "smooth" });
    }
  }, [activeId]);

  return (
    // Sticks under the header at the header's height for each width (64 / 80 /
    // 110px — see SiteHeader); a fixed 110px left a 46px gap on a phone that
    // the menu scrolled through. `data-menu-bar` is how VendorMenu measures it.
    <div
      data-menu-bar
      // Edge to edge on a phone (`-mx-4 px-4` cancels the page gutter): the
      // category strip inside it runs to the screen's edges, and a bar that
      // stopped 16px short let the menu show through beside it while stuck.
      className="border-line bg-surface sticky top-16 z-20 flex flex-wrap items-center gap-x-12 gap-y-3 border-b py-3 max-sm:-mx-4 max-sm:px-4 sm:top-20 sm:py-4 lg:top-[6.875rem]"
    >
      {/* The wrapper takes the width: the icon variant of Input wraps itself in
          a `relative` div that, in a flex row, sizes to its content. */}
      <div className="w-full sm:w-80">
      <Input
        type="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        aria-label={searchLabel}
        placeholder={searchPlaceholder}
        startIcon={<Icon name="search" className="size-4" />}
        className="rounded-8 text-14 h-11 w-full sm:h-13"
      />
      </div>

      {/* One swipeable line on a phone — the categories used to wrap into
          three or four rows of a sticky bar, covering a third of the screen. */}
      <nav aria-label={navLabel} className="min-w-0 max-sm:w-full">
        <ul ref={strip} className={cn("flex flex-wrap items-center gap-6", PHONE_STRIP)}>
          {categories.map((category) => {
            const active = category.id === activeId;
            return (
              <li key={category.id} className="shrink-0 snap-start" data-active={active || undefined}>
                <a
                  href={`#menu-${category.id}`}
                  aria-current={active ? "location" : undefined}
                  className={cn(
                    "text-14 sm:text-16 flex flex-col items-center gap-1 font-semibold whitespace-nowrap transition-colors",
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
