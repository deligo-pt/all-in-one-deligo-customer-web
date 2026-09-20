import type { CartCopy } from "@/features/cart";

/**
 * The cart view's copy, built from the `cart` and `nav` dictionaries.
 *
 * The development page loads its namespaces itself, so `t` is passed in rather
 * than `@/i18n/server` being imported here — this file needs no request
 * context. It exists so the fixture is reviewed against the strings customers
 * will read: a states page with wording of its own proves the layout and
 * nothing about the copy.
 */
export function cartCopy(
  t: (key: string) => string,
  nav: (key: string) => string,
): CartCopy {
  return {
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
    addons: t("addons"),

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
}
