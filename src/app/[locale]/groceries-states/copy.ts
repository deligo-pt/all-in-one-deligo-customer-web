import type { GroceryListingCopy, StoreViewCopy } from "@/features/groceries";

type T = (key: string) => string;

/** The grocery views' copy from the `groceries`, `food` and `cart`
 *  dictionaries — the same keys the shipping pages read. */
export function listingCopy(t: T, food: T): GroceryListingCopy {
  return {
    deliveringTo: food("deliveringTo"),
    change: food("changeAddress"),
    setAddress: food("setAddress"),
    availability: t("storesAvailable"),
    storeImage: t("storeImage"),
    rating: food("rating"),
    emptyTitle: t("noStores"),
    emptyBody: t("noStoresBody"),
    unavailableTitle: t("storesUnavailable"),
    unavailableBody: t("storesUnavailableBody"),
    noLocationTitle: food("noLocationTitle"),
    noLocationBody: t("noLocationBody"),
    noLocationAction: food("setAddress"),
  };
}

export function storeCopy(t: T, food: T, cart: T): StoreViewCopy {
  return {
    dealsTitle: food("availableDeals"),
    dealsSubtitle: food("availableDealsBody"),
    searchLabel: t("searchStore"),
    searchPlaceholder: food("searchItemsPlaceholder"),
    aisleNav: t("aisleNavigation"),
    noMatches: t("noProducts"),
    noMatchesBody: t("noProductsBody"),
    noProducts: t("storeEmpty"),
    noProductsBody: t("storeEmptyBody"),
    addToCart: food("addToCart"),
    signInToAdd: food("signInToAdd"),
    signIn: food("signInAction"),
    cart: {
      title: food("yourCart"),
      empty: food("cartEmpty"),
      line: {
        remove: cart("remove"),
        quantity: cart("quantity"),
        increase: cart("increaseQuantity"),
        decrease: cart("decreaseQuantity"),
        itemImage: cart("itemImage"),
        addons: cart("addons"),
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
  };
}
