import type { Metadata } from "next";
import {
  CartView,
  buildTabs,
  cartItemCount,
  storeItemCount,
  type Cart,
  type CartCopy,
} from "@/features/cart";
import { readCart } from "@/services/cart/server";
import { getLocale, getTranslations } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("cart");
  return { title: t("title") };
}

/**
 * `/cart` — the cart.
 *
 * A Server Component that reads `/carts/view-cart` (Phase 17) and hands one
 * client view the result; every write in that view re-renders this page. The
 * proxy has already required a session. A cart that cannot be read renders
 * its own sentence, not an empty cart.
 *
 * ## Every counted string is resolved here
 *
 * "7 items", "2 items", "Food (3)" — a number joined to a plural noun, which
 * `Intl.PluralRules` decides and the browser should not have to. See
 * `features/cart/summary.ts`.
 */
export default async function CartPage() {
  const [t, nav, locale] = await Promise.all([
    getTranslations("cart"),
    getTranslations("nav"),
    getLocale(),
  ]);

  let cart: Cart = { stores: [] };
  let unavailable = false;
  try {
    cart = (await readCart()) ?? { stores: [] };
  } catch {
    unavailable = true;
  }

  // The verticals are named once, in `nav`. The header, the footer and this
  // row cannot then disagree about what "Groceries" is called.
  const tabs = buildTabs(cart, {
    all: t("filterAll"),
    food: nav("food"),
    groceries: nav("groceries"),
    electronics: nav("electronics"),
  });

  const itemsLabels = Object.fromEntries(
    cart.stores.map((store) => [store.id, t.plural("items", storeItemCount(store))]),
  );

  const items = t.plural("items", cartItemCount(cart));
  // The cart's value is printed beside the count when the backend states one,
  // and omitted when it does not. Adding the stores up here to fill the pill
  // would be inventing a number nobody agreed to (D-4).
  const headerLabel = cart.total ? `${items} · ${cart.total}` : items;

  const copy: CartCopy = {
    title: t("title"),
    subtitle: t("subtitle"),
    filters: t("filters"),

    chooseStore: t("chooseStore"),
    selectStore: t("selectStore"),
    selectedStore: t("selectedStore"),
    deliveryEstimate: t("deliveryEstimate"),
    subtotal: t("chargeSubtotal"),
    verticalLabel: {
      food: nav("food"),
      groceries: nav("groceries"),
      electronics: nav("electronics"),
    },

    remove: t("remove"),
    quantity: t("quantity"),
    increase: t("increaseQuantity"),
    decrease: t("decreaseQuantity"),
    itemImage: t("itemImage"),

    deliveryIn: t("deliveryIn"),
    addMoreItems: t("addMoreItems"),
    applyVoucher: t("applyVoucher"),
    orderSummary: t("orderSummary"),
    charge: {
      subtotal: t("chargeSubtotal"),
      delivery: t("chargeDelivery"),
      service: t("chargeService"),
      tip: t("chargeTip"),
      discount: t("chargeDiscount"),
    },
    grandTotal: t("grandTotal"),
    placeOrder: t("placeOrder"),

    emptyTitle: t("emptyTitle"),
    emptyBody: t("emptyBody"),
    browse: t("browse"),
    unavailableTitle: t("unavailableTitle"),
    unavailableBody: t("unavailableBody"),
    notWired: t("notWired"),
    actionFailed: t("actionFailed"),
    selectToSeeTotal: t("selectToSeeTotal"),
  };

  return (
    <CartView
      cart={cart}
      tabs={tabs}
      itemsLabels={itemsLabels}
      headerLabel={headerLabel}
      copy={copy}
      locale={locale}
      unavailable={unavailable}
    />
  );
}
