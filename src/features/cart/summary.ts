import { CART_VERTICALS, type Cart, type CartStore, type CartVertical } from "./types";

/**
 * The counted things on the cart screen, computed on the **server**.
 *
 * Two of the design's labels are a number joined to a plural noun — the header
 * pill's "7 items" and each store's "2 items" — and one is a number joined to
 * a vertical's name, "Food (3)". Counting is easy; choosing between "item" and
 * "items" is not, and `Intl.PluralRules` is what decides it. Doing that in the
 * browser would mean either shipping the rule twice or hard-coding
 * `n === 1`, which `@/lib/i18n/translate` explains at length is the comparison
 * nobody finds again when a language with three plural forms is added.
 *
 * So the page resolves every counted string before rendering, exactly as
 * `DeliveryBar` does with its "120 restaurants available", and the client view
 * receives finished text. Filtering by tab never changes any of these numbers:
 * a store's count is its own, and the header's is the whole cart's.
 *
 * **The one sum this feature performs is a count of items.** Quantities are
 * integers the backend sent; nothing here touches a price. `verify:cart`
 * enforces the difference.
 */

export function storeItemCount(store: CartStore): number {
  return store.lines.reduce((n, line) => n + line.quantity, 0);
}

export function cartItemCount(cart: Cart): number {
  return cart.stores.reduce((n, store) => n + storeItemCount(store), 0);
}

/** The tab a store belongs to, or `all`. */
export type TabId = "all" | CartVertical;

export type CartTab = {
  id: TabId;
  /** "All (7)", "Food (3)" — resolved, ready to render. */
  label: string;
};

/**
 * The tab row, derived from the cart rather than declared.
 *
 * The design draws four tabs because its sample cart happens to hold three
 * verticals. A fixed row would show `Electronics (0)` to somebody who has only
 * ordered dinner, and a tab that filters to nothing is a control that can only
 * disappoint. `All` is always present; the rest appear when they have
 * something in them, in the design's order.
 */
export function buildTabs(
  cart: Cart,
  names: Record<TabId, string>,
): readonly CartTab[] {
  const label = (id: TabId, n: number) => ({ id, label: `${names[id]} (${n})` });

  return [
    label("all", cartItemCount(cart)),
    ...CART_VERTICALS.map((vertical) => {
      const stores = cart.stores.filter((store) => store.vertical === vertical);
      const n = stores.reduce((sum, store) => sum + storeItemCount(store), 0);
      return { vertical, n };
    })
      .filter((entry) => entry.n > 0)
      .map((entry) => label(entry.vertical, entry.n)),
  ];
}
