import type { ListingCopy, MenuCopy } from "@/features/food";

/**
 * The two copy objects the food views take, built from the `food` dictionary.
 *
 * Shared by the real pages' shapes and the development states page so the
 * fixture is reviewed against the same strings customers will read — a states
 * page with its own wording proves the layout and nothing about the copy.
 *
 * `t` is passed in rather than imported: this file is used from a page that
 * loads the namespace itself, and importing `@/i18n/server` here would tie it
 * to a request context it does not need.
 */
export function listingCopy(t: (key: string) => string): ListingCopy {
  return {
    deliveringTo: t("deliveringTo"),
    change: t("changeAddress"),
    setAddress: t("setAddress"),
    availability: t("restaurantsAvailable"),
    favouriteCuisines: t("favouriteCuisines"),
    allRestaurants: t("allRestaurants"),
    vendorImage: t("vendorImage"),
    rating: t("rating"),
    emptyTitle: t("noRestaurants"),
    emptyBody: t("noRestaurantsBody"),
    clearFilter: t("clearCuisine"),
    unavailableTitle: t("catalogueUnavailable"),
    unavailableBody: t("catalogueUnavailableBody"),
    noLocationTitle: t("noLocationTitle"),
    noLocationBody: t("noLocationBody"),
    noLocationAction: t("setAddress"),
  };
}

export function menuCopy(
  t: (key: string) => string,
  cart: (key: string) => string,
): MenuCopy {
  return {
    reviews: t("reviews"),
    dealsTitle: t("availableDeals"),
    dealsSubtitle: t("availableDealsBody"),
    searchLabel: t("searchItems"),
    searchPlaceholder: t("searchItemsPlaceholder"),
    menuNav: t("menuNavigation"),
    noMatches: t("noItems"),
    noMatchesBody: t("noItemsBody"),
    noMenu: t("noMenu"),
    noMenuBody: t("noMenuBody"),
    cart: {
      title: t("yourCart"),
      empty: t("cartEmpty"),
      line: {
        remove: cart("remove"),
        quantity: cart("quantity"),
        increase: cart("increaseQuantity"),
        decrease: cart("decreaseQuantity"),
        itemImage: cart("itemImage"),
      },
      charge: {
        subtotal: cart("chargeSubtotal"),
        delivery: cart("chargeDelivery"),
        service: cart("chargeService"),
        tip: cart("chargeTip"),
        discount: cart("chargeDiscount"),
      },
      grandTotal: cart("grandTotal"),
      checkout: cart("goToCheckout"),
      selectForCheckout: cart("chooseStore"),
      actionFailed: cart("actionFailed"),
    },
    signInToAdd: t("signInToAdd"),
    signIn: t("signInAction"),
    offlineAdd: t("offlineAdd"),
    addToCart: t("addToCart"),
    rating: t("rating"),
    product: {
      required: t("optionRequired"),
      chooseRequired: t("chooseRequiredOptions"),
      addToCart: t("addToCart"),
      quantity: t("quantity"),
      increase: t("increaseQuantity"),
      decrease: t("decreaseQuantity"),
      close: t("closeProduct"),
    },
  };
}
