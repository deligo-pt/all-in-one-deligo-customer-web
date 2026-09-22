"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import {
  StoreCartPanel,
  cartApi,
  type CartStore,
  type StoreCartCopy,
} from "@/features/cart";
import { useSession } from "@/hooks/useSession";
import { MenuNav, VendorIntro } from "@/features/food";
import { ProductCard } from "./ProductCard";
import type { GroceryStore } from "./types";

export type StoreViewCopy = {
  dealsTitle: string;
  dealsSubtitle: string;
  searchLabel: string;
  searchPlaceholder: string;
  aisleNav: string;
  noMatches: string;
  noMatchesBody: string;
  noProducts: string;
  noProductsBody: string;
  addToCart: string;
  signInToAdd: string;
  signIn: string;
  cart: StoreCartCopy;
};

/**
 * A grocery store — `gro Home` at 2719px.
 *
 * The top is the restaurant page's (`VendorIntro`); the aisle bar is its menu
 * bar. What is new is below: an 864px column of four-up product cards on 24px
 * gaps, and a 416px cart that is populated rather than empty.
 *
 * The search filters the aisles in place — the whole store is on the page, as
 * the whole menu is on a restaurant's.
 */
export function StoreView({
  store,
  cart,
  checkoutHref,
  loginHref,
  copy,
  offlineNotice,
}: {
  store: GroceryStore;
  /** This store's part of the cart, when there is one. */
  cart?: CartStore;
  checkoutHref: string;
  loginHref: string;
  copy: StoreViewCopy;
  /** Development preview: every press shows this and writes nothing. */
  offlineNotice?: string;
}) {
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState<{ text: string; signIn?: boolean } | null>(null);
  const [adding, setAdding] = useState<string | null>(null);
  const signedIn = useSession();
  const router = useRouter();

  // The API sets a line's quantity; one more is what the cart holds plus one.
  async function addOne(productId: string) {
    if (offlineNotice) return setNotice({ text: offlineNotice });
    if (!signedIn) return setNotice({ text: copy.signInToAdd, signIn: true });
    setAdding(productId);
    setNotice(null);
    const quantity =
      (cart?.lines.find((l) => l.productId === productId && !l.variationSku)
        ?.quantity ?? 0) + 1;
    try {
      await cartApi.add({ productId, quantity });
    } catch (error) {
      setNotice({
        text:
          error instanceof Error && error.message
            ? error.message
            : copy.cart.actionFailed,
      });
    } finally {
      router.refresh();
      setAdding(null);
    }
  }

  const aisles = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return store.aisles;
    return store.aisles
      .map((aisle) => ({
        ...aisle,
        products: aisle.products.filter((p) => p.name.toLowerCase().includes(needle)),
      }))
      .filter((aisle) => aisle.products.length > 0);
  }, [query, store.aisles]);

  return (
    <div className="max-w-shell mx-auto flex w-full flex-col gap-8 px-4 sm:px-8 py-8">
      <VendorIntro
        vendor={store}
        dealsTitle={copy.dealsTitle}
        dealsSubtitle={copy.dealsSubtitle}
      />

      <MenuNav
        categories={store.aisles}
        activeId={aisles[0]?.id}
        query={query}
        onQueryChange={setQuery}
        searchLabel={copy.searchLabel}
        searchPlaceholder={copy.searchPlaceholder}
        navLabel={copy.aisleNav}
      />

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-8">
          {notice ? (
            <div
              role="status"
              className="bg-surface-warm text-ink-warm text-14 rounded-12 flex flex-wrap items-center justify-between gap-3 p-4"
            >
              <span>{notice.text}</span>
              {notice.signIn ? (
                <Button size="sm" asChild>
                  <Link href={loginHref}>{copy.signIn}</Link>
                </Button>
              ) : null}
            </div>
          ) : null}

          {store.aisles.length === 0 ? (
            <EmptyState
              icon={<Icon name="shop" className="size-8" />}
              title={copy.noProducts}
              description={copy.noProductsBody}
            />
          ) : aisles.length === 0 ? (
            <EmptyState
              icon={<Icon name="search" className="size-8" />}
              title={copy.noMatches}
              description={copy.noMatchesBody}
            />
          ) : (
            aisles.map((aisle) => (
              <section
                key={aisle.id}
                id={`menu-${aisle.id}`}
                className="flex scroll-mt-44 flex-col gap-6"
              >
                <h2 className="text-20 text-ink font-semibold">{aisle.name}</h2>
                <ul className="grid grid-cols-2 gap-6 md:grid-cols-3 xl:grid-cols-4">
                  {aisle.products.map((product) => (
                    <li key={product.id}>
                      <ProductCard
                        product={product}
                        addLabel={copy.addToCart}
                        onAdd={() => void addOne(product.id)}
                        busy={adding === product.id}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>

        {/* Below `lg` the panel sits under the whole menu, where an *empty*
            cart is a large card saying nothing at the end of the scroll
            (phone-first pass, 22 Sep 2026). It shows there once it holds
            something; beside the menu, from `lg`, it always shows. */}
        <div
          className={cn(
            "lg:w-104 lg:shrink-0",
            (!cart || cart.lines.length === 0) && "max-lg:hidden",
          )}
        >
          <div className="sticky top-[8rem]">
            <StoreCartPanel
              store={cart}
              checkoutHref={checkoutHref}
              copy={copy.cart}
              offlineNotice={offlineNotice}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
