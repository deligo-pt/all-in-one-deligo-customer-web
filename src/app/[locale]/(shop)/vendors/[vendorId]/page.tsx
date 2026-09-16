import { notFound, redirect } from "next/navigation";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { VendorMenu, type MenuCopy, type VendorDetail } from "@/features/food";
import { getLocale, getTranslations } from "@/i18n/server";
import { withLocale } from "@/lib/i18n/path";
import { ROUTES } from "@/lib/routes";
import { isApiError } from "@/services/api/error";
import { readCart } from "@/services/cart/server";
import { foodCatalog, vendorUserIdFromMongoId } from "@/services/catalog/food";

/**
 * `/vendors/[vendorId]` — one restaurant (Phase 16).
 *
 * The id is the vendor's `userId` ("V-…"). A search hit carries the Mongo
 * `_id` instead, so an id that is not a `userId` is resolved through one of
 * the vendor's products and redirected to the canonical URL.
 *
 * An unknown vendor is a 404. A catalogue that cannot be reached is not —
 * answering it with "not found" would teach everyone to read a missing
 * restaurant as a network blip.
 */
export default async function VendorPage({
  params,
}: {
  params: Promise<{ vendorId: string }>;
}) {
  const [{ vendorId }, t, cartT, common, locale] = await Promise.all([
    params,
    getTranslations("food"),
    getTranslations("cart"),
    getTranslations("common"),
    getLocale(),
  ]);

  if (!vendorId.startsWith("V-")) {
    const userId = await vendorUserIdFromMongoId(vendorId).catch(() => null);
    if (!userId) notFound();
    redirect(withLocale(ROUTES.vendor.path.replace("[vendorId]", userId), locale));
  }

  let vendor: VendorDetail | null = null;
  try {
    vendor = await (await foodCatalog()).getVendor(vendorId);
  } catch (error) {
    if (isApiError(error) && error.status === 404) notFound();
  }

  if (!vendor) {
    return (
      <div className="max-w-shell mx-auto w-full px-8 py-16">
        <EmptyState
          icon={<Icon name="shop" className="size-8" />}
          title={t("vendorUnavailable")}
          description={t("vendorUnavailableBody")}
        />
      </div>
    );
  }

  const copy: MenuCopy = {
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
    storeDetails: {
      trigger: t("storeDetailsTrigger"),
      subtitle: t("storeDetailsSubtitle"),
      close: common("close"),
      open: t("openNow"),
      closed: t("closedNow"),
      hours: t("storeHours"),
      closingDays: t("storeClosingDays"),
      preparation: t("storePreparation"),
      address: t("storeAddress"),
      phone: t("storePhone"),
      email: t("storeEmail"),
      nif: t("storeNif"),
      contactTitle: t("contactInformation"),
      otherTitle: t("otherDetails"),
      legalName: t("legalEntityName"),
      euCompliance: t("euCompliance"),
      mapUnavailable: t("mapUnavailable"),
      closingSoon: t("closingSoon"),
      orderWithin: t("orderWithin"),
    },
    cart: {
      title: t("yourCart"),
      empty: t("cartEmpty"),
      line: {
        remove: cartT("remove"),
        quantity: cartT("quantity"),
        increase: cartT("increaseQuantity"),
        decrease: cartT("decreaseQuantity"),
        itemImage: cartT("itemImage"),
      },
      charge: {
        subtotal: cartT("chargeSubtotal"),
        delivery: cartT("chargeDelivery"),
        service: cartT("chargeService"),
        tip: cartT("chargeTip"),
        discount: cartT("chargeDiscount"),
      },
      grandTotal: cartT("grandTotal"),
      checkout: cartT("goToCheckout"),
      selectForCheckout: cartT("chooseStore"),
      actionFailed: cartT("actionFailed"),
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

  // Signed in, this vendor's part of the cart sits beside the menu. A cart
  // that cannot be read leaves the panel empty; the menu still works.
  const cart = await readCart().catch(() => null);
  const self = withLocale(ROUTES.vendor.path.replace("[vendorId]", vendorId), locale);

  return (
    <VendorMenu
      vendor={vendor}
      copy={copy}
      locale={locale}
      cart={cart?.stores.find((store) => store.vendorId === vendor.recordId)}
      checkoutHref={withLocale(ROUTES.checkout.path, locale)}
      loginHref={`${withLocale(ROUTES.login.path, locale)}?next=${encodeURIComponent(self)}`}
    />
  );
}
