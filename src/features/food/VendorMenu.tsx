"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { ImageSlot } from "@/components/shared/ImageSlot";
import { CartPanel } from "./CartPanel";
import { DealCard } from "./DealCard";
import { MenuItemCard } from "./MenuItemCard";
import { MenuNav } from "./MenuNav";
import type { ProductCopy } from "./ProductModal";
import type { ProductDetail, VendorDetail } from "./types";

/**
 * The dish modal arrives on the first press of an add button, not with the
 * page.
 *
 * It is a Radix dialog carrying a radio group, checkbox groups, a stepper and
 * a textarea — the most expensive thing in the vertical — and a customer who
 * only browses a menu never opens it. Same measurement that moved the mobile
 * drawer in Phase 5 and the sign-in panel in Phase 6, on a route that has no
 * budget left to spend (D-7).
 */
const ProductModal = dynamic(
  () => import("./ProductModal").then((m) => m.ProductModal),
  { ssr: false },
);

export type MenuCopy = {
  reviews: string;
  dealsTitle: string;
  dealsSubtitle: string;
  searchLabel: string;
  searchPlaceholder: string;
  menuNav: string;
  noMatches: string;
  noMatchesBody: string;
  cartTitle: string;
  cartEmpty: string;
  addToCart: string;
  rating: string;
  product: ProductCopy;
};

/**
 * A vendor's page: the hero, who they are, their offers, and the menu.
 *
 * Measured from `food Home` at 2633px — a 1312 container; a 448px hero at 16px
 * radius; the name at 32/600 over the address at 16/400 and a meta row at
 * 14/400; the deals as 280×172 cards; then the menu bar and a two-column
 * layout of 864 and 416 with the cart on the end.
 *
 * ## The search is client-side, and that is not a shortcut
 *
 * The whole menu is already on the page — the design stacks every category,
 * one after another — so filtering it here is both instant and complete. An
 * endpoint would be slower and could only return the same answer. `/search` is
 * a different feature: it searches across vendors, and it is Phase 16's.
 *
 * ## Nothing adds to the cart yet
 *
 * The add buttons are real controls with real names and they do nothing.
 * `/carts/add` needs the option modal that has to precede it for any dish with
 * a variation, and both are Phase 8 and Phase 17. A button that silently did
 * nothing *and* looked like it worked is the failure this project was started
 * to stop repeating; a button that is plainly not wired yet is not that.
 */
export function VendorMenu({
  vendor,
  copy,
  loadProduct,
}: {
  vendor: VendorDetail;
  copy: MenuCopy;
  /**
   * Turns a menu item into the thing that can be ordered — `/products/:id`
   * plus its add-on groups. Phase 16 supplies it; without it the add buttons
   * have nothing to open, which is the honest state while the catalogue is
   * not connected.
   */
  loadProduct?: (itemId: string) => ProductDetail | undefined;
}) {
  const [query, setQuery] = useState("");
  const [product, setProduct] = useState<ProductDetail | null>(null);

  const categories = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return vendor.menu;
    return vendor.menu
      .map((category) => ({
        ...category,
        items: category.items.filter(
          (item) =>
            item.name.toLowerCase().includes(needle) ||
            item.description?.toLowerCase().includes(needle),
        ),
      }))
      .filter((category) => category.items.length > 0);
  }, [query, vendor.menu]);

  const meta = [
    vendor.cuisines.join(" · ") || null,
    vendor.deliveryTime ?? null,
  ].filter(Boolean);

  return (
    <div className="max-w-shell mx-auto flex w-full flex-col gap-8 px-8 py-8">
      <ImageSlot
        src={vendor.heroImage}
        alt={vendor.name}
        sizes="(max-width: 1440px) 100vw, 1312px"
        className="rounded-16 aspect-[1312/448] w-full"
      />

      <header className="flex flex-col gap-3">
        <h1 className="text-32 text-ink font-semibold">{vendor.name}</h1>
        {vendor.address ? (
          <p className="text-16 text-ink-muted flex items-center gap-2">
            <Icon name="location" className="size-4 shrink-0" />
            {vendor.address}
          </p>
        ) : null}
        <p className="text-14 text-ink-muted flex flex-wrap items-center gap-2">
          {vendor.rating ? (
            <span className="text-ink inline-flex items-center gap-1 font-semibold">
              <Icon name="star" className="text-rating size-4" />
              {vendor.rating}
              {vendor.reviewsLabel ? (
                <span className="font-medium"> {vendor.reviewsLabel}</span>
              ) : null}
            </span>
          ) : null}
          {meta.map((entry) => (
            <span key={entry} className="flex items-center gap-2">
              <span aria-hidden>·</span>
              {entry}
            </span>
          ))}
        </p>
      </header>

      {vendor.deals.length ? (
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-20 text-ink font-semibold">{copy.dealsTitle}</h2>
            <p className="text-16 text-ink-muted">{copy.dealsSubtitle}</p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {vendor.deals.map((deal) => (
              <li key={deal.id}>
                <DealCard deal={deal} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <MenuNav
        categories={vendor.menu}
        activeId={categories[0]?.id}
        query={query}
        onQueryChange={setQuery}
        searchLabel={copy.searchLabel}
        searchPlaceholder={copy.searchPlaceholder}
        navLabel={copy.menuNav}
      />

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-8">
          {categories.length === 0 ? (
            <EmptyState
              icon={<Icon name="search" className="size-8" />}
              title={copy.noMatches}
              description={copy.noMatchesBody}
            />
          ) : (
            categories.map((category) => (
              <section
                key={category.id}
                id={`menu-${category.id}`}
                className="flex scroll-mt-44 flex-col gap-6"
              >
                <h2 className="text-20 text-ink font-semibold">{category.name}</h2>
                <ul className="grid gap-4 xl:grid-cols-2">
                  {category.items.map((item) => (
                    <li key={item.id}>
                      <MenuItemCard
                        item={item}
                        addLabel={copy.addToCart}
                        onAdd={
                          loadProduct
                            ? (id) => setProduct(loadProduct(id) ?? null)
                            : undefined
                        }
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>

        <div className="lg:w-104 lg:shrink-0">
          <div className="sticky top-[8rem]">
            <CartPanel title={copy.cartTitle} emptyLabel={copy.cartEmpty} />
          </div>
        </div>
      </div>

      {/* Mounted on the first open and kept, so closing plays the exit
          transition rather than removing the dialog mid-animation. */}
      {product ? (
        <ProductModal
          product={product}
          open={product !== null}
          onOpenChange={(next) => {
            if (!next) setProduct(null);
          }}
          copy={copy.product}
        />
      ) : null}
    </div>
  );
}
