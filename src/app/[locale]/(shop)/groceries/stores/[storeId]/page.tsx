import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { notFound } from "next/navigation";
import { StoreView, type StoreViewCopy } from "@/features/groceries";
import { isApiError } from "@/services/api/error";
import { readCart } from "@/services/cart/server";
import { groceryCatalog } from "@/services/catalog/groceries";
import { getLocale, getTranslations } from "@/i18n/server";
import { withLocale } from "@/lib/i18n/path";
import { ROUTES } from "@/lib/routes";

/**
 * `/groceries/stores/[storeId]` — one store, its shelves and its part of the
 * cart.
 *
 * Two reads that fail separately: a store that cannot be read is an
 * unavailable page; a cart that cannot be read is an empty panel on a page
 * that still works. Not `notFound()` for the unavailable case — an unknown
 * store is a 404, an unreachable catalogue is not. The cart is Phase 17's.
 */
export default async function GroceryStorePage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const [{ storeId }, t, food, cart, locale] = await Promise.all([
    params,
    getTranslations("groceries"),
    getTranslations("food"),
    getTranslations("cart"),
    getLocale(),
  ]);

  const [storeRead, cartRead] = await Promise.allSettled([
    groceryCatalog().then((catalog) => catalog.getStore(storeId)),
    readCart(),
  ]);

  if (storeRead.status === "rejected") {
    if (isApiError(storeRead.reason) && storeRead.reason.status === 404) notFound();
    return (
      <div className="max-w-shell mx-auto w-full px-4 sm:px-8 py-16">
        <EmptyState
          icon={<Icon name="shop" className="size-8" />}
          title={t("storeUnavailable")}
          description={t("storeUnavailableBody")}
        />
      </div>
    );
  }

  const store = storeRead.value;
  const cartStore =
    cartRead.status === "fulfilled"
      ? cartRead.value?.stores.find((entry) => entry.vendorId === store.recordId)
      : undefined;
  const self = withLocale(
    ROUTES.groceryStore.path.replace("[storeId]", storeId),
    locale,
  );

  const copy: StoreViewCopy = {
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

  return (
    <StoreView
      store={store}
      cart={cartStore}
      checkoutHref={withLocale(ROUTES.checkout.path, locale)}
      loginHref={`${withLocale(ROUTES.login.path, locale)}?next=${encodeURIComponent(self)}`}
      copy={copy}
    />
  );
}
