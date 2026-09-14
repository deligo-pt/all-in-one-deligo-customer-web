import type { Metadata } from "next";
import {
  GroceryListing,
  type GroceryListingCopy,
  type StoreListing,
} from "@/features/groceries";
import { getLocale, getTranslations } from "@/i18n/server";
import { withLocale } from "@/lib/i18n/path";
import { ROUTES } from "@/lib/routes";
import { groceryCatalog } from "@/services/catalog/groceries";
import { getDeliveryLocation } from "@/services/location/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("groceries");
  return { title: t("allStores") };
}

/** `/groceries/stores` — stores near the delivery location (Phase 16). */
export default async function GroceryStoresPage() {
  const [t, food, locale, location] = await Promise.all([
    getTranslations("groceries"),
    getTranslations("food"),
    getLocale(),
    getDeliveryLocation(),
  ]);

  let listing: StoreListing = { shelves: [] };
  let unavailable = false;
  if (location) {
    try {
      listing = await (await groceryCatalog()).listStores({ location });
    } catch {
      unavailable = true;
    }
  }

  const copy: GroceryListingCopy = {
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

  return (
    <GroceryListing
      locale={locale}
      listing={listing}
      copy={copy}
      address={location?.label || (location ? food("currentLocation") : undefined)}
      changeHref={withLocale(ROUTES.groceries.path, locale)}
      unavailable={unavailable}
    />
  );
}
