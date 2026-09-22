"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import {
  StoreCartPanel,
  cartApi,
  type AddToCartInput,
  type CartStore,
  type StoreCartCopy,
} from "@/features/cart";
import { MenuItemCard } from "./MenuItemCard";
import { MenuNav } from "./MenuNav";
import type { ProductChoice, ProductCopy } from "./ProductModal";
import type { MenuItem, ProductDetail, VendorDetail } from "./types";
import { useSession } from "@/hooks/useSession";
import type { Locale } from "@/lib/i18n/locale";
import { StoreDetailsPanel, type StoreDetailsCopy } from "./StoreDetailsPanel";
import { VendorIntro } from "./VendorIntro";

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
  noMenu: string;
  noMenuBody: string;
  cart: StoreCartCopy;
  storeDetails: StoreDetailsCopy;
  signInToAdd: string;
  signIn: string;
  /** The states page's answer to an add: it never writes a real cart. */
  offlineAdd: string;
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
  locale,
  products,
  cart,
  checkoutHref,
  loginHref,
}: {
  vendor: VendorDetail;
  copy: MenuCopy;
  locale: Locale;
  /** This vendor's part of the live cart, when it has one. */
  cart?: CartStore;
  checkoutHref: string;
  /** `/login?next=` back to this page. */
  loginHref: string;
  /** Fully resolved dishes by id — the development states page's fixture.
   *  Live, a dish opens with its variations and its add-on groups load. */
  products?: Readonly<Record<string, ProductDetail>>;
}) {
  const [query, setQuery] = useState("");
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const signedIn = useSession();
  const router = useRouter();
  const [notice, setNotice] = useState<{ text: string; signIn?: boolean } | null>(null);

  /** The quantity a line already has. The API sets quantities, so adding one
   *  more is sending this plus one. */
  const inCart = (productId: string, variationSku?: string) =>
    cart?.lines.find(
      (line) => line.productId === productId && line.variationSku === variationSku,
    )?.quantity ?? 0;

  async function add(input: AddToCartInput): Promise<string | null> {
    if (products) {
      setNotice({ text: copy.offlineAdd });
      return copy.offlineAdd;
    }
    if (!signedIn) {
      setNotice({ text: copy.signInToAdd, signIn: true });
      return copy.signInToAdd;
    }
    setNotice(null);
    try {
      await cartApi.add(input);
      return null;
    } catch (error) {
      const text =
        error instanceof Error && error.message
          ? error.message
          : copy.cart.actionFailed;
      setNotice({ text });
      return text;
    } finally {
      router.refresh();
    }
  }

  const open = (item: MenuItem) => {
    const fixed = products?.[item.id];
    if (fixed) return setProduct(fixed);
    const base: ProductDetail = { ...item, options: item.options ?? [] };
    setProduct(base);
    if (item.addonGroupIds?.length && signedIn) {
      void import("./addons")
        .then(({ loadAddonGroups }) => loadAddonGroups(item.addonGroupIds!, locale))
        .then((groups) =>
          setProduct((current) =>
            current?.id === item.id
              ? { ...current, options: [...base.options, ...groups] }
              : current,
          ),
        )
        .catch(() => undefined);
    }
  };

  /**
   * Which category the reader is actually looking at (Phase 20d).
   *
   * The rail used to mark the first category for ever, so it said "Starters"
   * at the bottom of the desserts. An observer against the sticky bar's own
   * offset marks the section that owns the top of what is visible, and
   * clicking a link still scrolls with the anchor rather than being hijacked
   * by script.
   *
   * **The offset is measured, not assumed.** It was 176px — right for the
   * 110px desktop header and a one-line bar. On a phone (phone-first pass,
   * 22 Sep 2026) the header is 64px and the bar is two rows, so a fixed 176
   * marked the wrong category and dropped a tapped category's heading under
   * the bar. `stickyBottom` is where the header and the bar end, kept current
   * as either changes height.
   */
  const [active, setActive] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [stickyBottom, setStickyBottom] = useState(176);

  useEffect(() => {
    const header = document.querySelector("header");
    const bar = document.querySelector<HTMLElement>("[data-menu-bar]");
    if (!header || !bar) return;
    const measure = () => setStickyBottom(header.offsetHeight + bar.offsetHeight);
    const observer = new ResizeObserver(measure);
    observer.observe(header);
    observer.observe(bar);
    return () => observer.disconnect();
  }, []);

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

  useEffect(() => {
    const root = menuRef.current;
    if (!root) return;
    const sections = Array.from(root.querySelectorAll<HTMLElement>("[data-category]"));
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // The topmost section still intersecting wins, so scrolling up marks
        // the section being scrolled into and not the one being left.
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        const id = visible?.target.getAttribute("data-category");
        if (id) setActive(id);
      },
      // The header and the sticky search-and-rail bar cover the top of the
      // screen; without this the section behind them would count as visible.
      { rootMargin: `-${stickyBottom}px 0px -60% 0px`, threshold: 0 },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [categories, stickyBottom]);

  return (
    <div className="max-w-shell mx-auto flex w-full flex-col gap-8 px-4 sm:px-8 py-8">
      <VendorIntro
        vendor={vendor}
        dealsTitle={copy.dealsTitle}
        dealsSubtitle={copy.dealsSubtitle}
        storeDetails={
          <StoreDetailsPanel
            details={vendor.details}
            closing={vendor.closing}
            open={vendor.status === "open"}
            name={vendor.name}
            locale={locale}
            copy={copy.storeDetails}
          />
        }
      />

      <MenuNav
        categories={vendor.menu}
        activeId={active ?? categories[0]?.id}
        query={query}
        onQueryChange={setQuery}
        searchLabel={copy.searchLabel}
        searchPlaceholder={copy.searchPlaceholder}
        navLabel={copy.menuNav}
      />

      <div className="flex flex-col gap-8 lg:flex-row">
        <div
          ref={menuRef}
          // A tapped category lands just under the bar, whatever its height.
          // `--dg-` because the design guard admits a bracketed value only
          // when it names one of the app's own variables.
          style={{ "--dg-menu-offset": `${stickyBottom + 8}px` } as React.CSSProperties}
          className="flex min-w-0 flex-1 flex-col gap-8"
        >
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
          {vendor.menu.length === 0 ? (
            // Nothing to search is not the same as a search that found
            // nothing — and only the second is the customer's to fix.
            <EmptyState
              icon={<Icon name="shop" className="size-8" />}
              title={copy.noMenu}
              description={copy.noMenuBody}
            />
          ) : categories.length === 0 ? (
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
                data-category={category.id}
                className="flex scroll-mt-[var(--dg-menu-offset)] flex-col gap-6"
              >
                <h2 className="text-20 text-ink font-semibold">{category.name}</h2>
                <ul className="grid gap-4 xl:grid-cols-2">
                  {category.items.map((item) => (
                    <li key={item.id}>
                      <MenuItemCard
                        item={item}
                        addLabel={copy.addToCart}
                        onAdd={() =>
                          item.options?.length ||
                          item.addonGroupIds?.length ||
                          products?.[item.id]
                            ? open(item)
                            : void add({
                                productId: item.id,
                                quantity: inCart(item.id) + 1,
                              })
                        }
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
              offlineNotice={products ? copy.offlineAdd : undefined}
            />
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
          onAdd={(choice: ProductChoice) =>
            add({
              productId: product.id,
              quantity: inCart(product.id, choice.variationSku) + choice.quantity,
              variationSku: choice.variationSku,
              addons: choice.addons,
            })
          }
        />
      ) : null}
    </div>
  );
}
