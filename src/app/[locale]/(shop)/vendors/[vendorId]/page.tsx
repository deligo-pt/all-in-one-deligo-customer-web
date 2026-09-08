import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import {
  CatalogUnavailableError,
  VendorMenu,
  notWiredCatalog,
  type MenuCopy,
  type VendorDetail,
} from "@/features/food";
import { getTranslations } from "@/i18n/server";

/**
 * `/vendors/[vendorId]` — one restaurant.
 *
 * The hero, the identity row, the offers, the menu and the cart panel, over
 * the `VendorDetail` shape Phase 16 fills. In Track B the catalogue rejects
 * and the page says so; every component below it is built and is reviewable
 * populated at `/food-states`.
 *
 * `notFound()` is deliberately **not** called for the unavailable case. A
 * vendor id that does not exist is a 404; a catalogue that is not connected is
 * not — and answering the second with the first would train everyone to read
 * "restaurant not found" as "not built yet", right up until a real one goes
 * missing.
 */
export default async function VendorPage() {
  const t = await getTranslations("food");

  let vendor: VendorDetail | null = null;
  try {
    vendor = await notWiredCatalog.getVendor("");
  } catch (error) {
    if (!(error instanceof CatalogUnavailableError)) throw error;
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

  return <VendorMenu vendor={vendor} copy={copy} />;
}
