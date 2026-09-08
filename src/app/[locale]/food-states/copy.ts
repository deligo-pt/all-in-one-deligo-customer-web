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
    filters: {
      title: t("filtersTitle"),
      reset: t("filtersReset"),
      sort: t("sortBy"),
      delivery: t("delivery"),
      deals: t("deals"),
      dietary: t("dietary"),
      cuisine: t("cuisine"),
      sortOption: {
        recommended: t("sortRecommended"),
        "best-value": t("sortBestValue"),
        "price-asc": t("sortPriceAsc"),
        "price-desc": t("sortPriceDesc"),
      },
      deliveryOption: {
        instant: t("deliveryInstant"),
        pickup: t("deliveryPickup"),
      },
    },
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
    unavailableTitle: t("catalogueUnavailable"),
    unavailableBody: t("catalogueUnavailableBody"),
  };
}

export function menuCopy(t: (key: string) => string): MenuCopy {
  return {
    reviews: t("reviews"),
    dealsTitle: t("availableDeals"),
    dealsSubtitle: t("availableDealsBody"),
    searchLabel: t("searchItems"),
    searchPlaceholder: t("searchItemsPlaceholder"),
    menuNav: t("menuNavigation"),
    noMatches: t("noItems"),
    noMatchesBody: t("noItemsBody"),
    cartTitle: t("yourCart"),
    cartEmpty: t("cartEmpty"),
    addToCart: t("addToCart"),
    rating: t("rating"),
    product: {
      required: t("optionRequired"),
      chooseRequired: t("chooseRequiredOptions"),
      specialInstructions: t("specialInstructions"),
      specialInstructionsPlaceholder: t("specialInstructionsPlaceholder"),
      addToCart: t("addToCart"),
      quantity: t("quantity"),
      increase: t("increaseQuantity"),
      decrease: t("decreaseQuantity"),
      close: t("closeProduct"),
      notWired: t("cartNotWired"),
    },
  };
}
