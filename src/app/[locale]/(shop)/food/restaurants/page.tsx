import type { Metadata } from "next";
import {
  CatalogUnavailableError,
  VendorListing,
  notWiredCatalog,
  type Cuisine,
  type ListingCopy,
  type Vendor,
} from "@/features/food";
import { getLocale, getTranslations } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("food");
  return { title: t("allRestaurants") };
}

/**
 * `/food/restaurants` — the listing.
 *
 * A Server Component that reads the catalogue and hands the result to one
 * client view. In Track B the catalogue rejects, so `unavailable` is true and
 * the grid says so — while the filter rail, the delivery bar and the page
 * around them are fully built and operable. That is the split this phase is
 * for: the layout is finished and provably correct, and the data arrives in
 * Phase 16 without any of it changing.
 *
 * The rejection is caught rather than thrown. Plan.md §2.3's "throws in
 * development" rule is for the verticals with **no** backend at all, where a
 * loud failure is what stops someone shipping an invented one; food has a real
 * catalogue that is simply not connected yet, and a route that crashes in
 * development is a route nobody can look at.
 */
export default async function RestaurantsPage() {
  const [t, locale] = await Promise.all([getTranslations("food"), getLocale()]);

  let vendors: readonly Vendor[] = [];
  let cuisines: readonly Cuisine[] = [];
  let unavailable = false;
  try {
    [vendors, cuisines] = await Promise.all([
      notWiredCatalog.listVendors({
        sort: "recommended",
        delivery: [],
        deals: [],
        dietary: [],
        cuisines: [],
      }),
      notWiredCatalog.listCuisines(),
    ]);
  } catch (error) {
    if (!(error instanceof CatalogUnavailableError)) throw error;
    unavailable = true;
  }

  const copy: ListingCopy = {
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

  return (
    <VendorListing
      locale={locale}
      vendors={vendors}
      cuisines={cuisines}
      // The facets are the catalogue's to describe — which deals exist, which
      // dietary tags a market uses. Inventing a list here would be inventing
      // the taxonomy, so the groups render empty until Phase 16.
      facets={{ deals: [], dietary: [], cuisines: [] }}
      copy={copy}
      unavailable={unavailable}
    />
  );
}
