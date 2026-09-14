import type { Metadata } from "next";
import {
  VendorListing,
  type Cuisine,
  type ListingCopy,
  type VendorPage,
} from "@/features/food";
import { getLocale, getTranslations } from "@/i18n/server";
import { withLocale } from "@/lib/i18n/path";
import { ROUTES } from "@/lib/routes";
import { foodCatalog } from "@/services/catalog/food";
import { getDeliveryLocation } from "@/services/location/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("food");
  return { title: t("allRestaurants") };
}

/**
 * `/food/restaurants` — restaurants near the delivery location (Phase 16).
 *
 * The location is the profile's active address or the guest's chosen one;
 * without either the page asks rather than guessing a city. The cuisine is
 * `?cuisine=`, applied by the API. A catalogue that cannot be reached renders
 * its own sentence — never an empty grid that reads as "nothing near you".
 */
export default async function RestaurantsPage({
  searchParams,
}: {
  searchParams: Promise<{ cuisine?: string | string[] }>;
}) {
  const [t, locale, location, query] = await Promise.all([
    getTranslations("food"),
    getLocale(),
    getDeliveryLocation(),
    searchParams,
  ]);
  const cuisine = typeof query.cuisine === "string" ? query.cuisine : undefined;

  let page: VendorPage = { vendors: [] };
  let cuisines: readonly Cuisine[] = [];
  let unavailable = false;
  if (location) {
    const catalog = await foodCatalog();
    const [vendorRead, cuisineRead] = await Promise.allSettled([
      catalog.listVendors({
        cuisine,
        location,
      }),
      catalog.listCuisines(),
    ]);
    if (vendorRead.status === "fulfilled") page = vendorRead.value;
    else unavailable = true;
    if (cuisineRead.status === "fulfilled") cuisines = cuisineRead.value;
  }

  const copy: ListingCopy = {
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

  return (
    <VendorListing
      locale={locale}
      vendors={page.vendors}
      cuisines={cuisines}
      copy={copy}
      address={location?.label || (location ? t("currentLocation") : undefined)}
      countLabel={page.countLabel}
      changeHref={withLocale(ROUTES.food.path, locale)}
      unavailable={unavailable}
    />
  );
}
