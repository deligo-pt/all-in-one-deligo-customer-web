import type { Metadata } from "next";
import {
  GroceryListing,
  type GroceryListingCopy,
  type StoreListing,
} from "@/features/groceries";
import { getLocale, getTranslations } from "@/i18n/server";
import type { Translator } from "@/i18n/translator";
import { withLocale } from "@/lib/i18n/path";
import { ROUTES } from "@/lib/routes";
import type { LocationModalCopy } from "@/components/shared/LocationModal";
import { groceryCatalog } from "@/services/catalog/groceries";
import { getDeliveryContext } from "@/services/location/server";

/** The picker's copy: the dialog's own strings plus the hero address bar's,
 *  which is its bottom half. */
function locationCopy(
  t: Translator<"food">,
  common: Translator<"common">,
): LocationModalCopy {
  return {
    title: t("locationTitle"),
    body: t("locationBody"),
    askTitle: t("locationAskTitle"),
    askBody: t("locationAskBody"),
    askLater: t("locationAskLater"),
    close: common("close"),
    savedTitle: t("locationSaved"),
    active: t("locationActive"),
    elsewhereTitle: t("locationElsewhere"),
    addNew: t("locationAddNew"),
    failed: t("locationFailed"),
    form: {
      addressLabel: t("addressLabel"),
      addressPlaceholder: t("addressPlaceholder"),
      locateMe: t("locateMe"),
      notFound: t("locationNotFound"),
      denied: t("locationDenied"),
      unavailable: t("locationUnavailable"),
      position: t("locationPosition"),
      currentLocation: t("currentLocation"),
    },
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("groceries");
  return { title: t("allStores") };
}

/** `/groceries/stores` — stores near the delivery location (Phase 16). */
export default async function GroceryStoresPage() {
  const [t, food, common, locale, { location, choices }] = await Promise.all([
    getTranslations("groceries"),
    getTranslations("food"),
    getTranslations("common"),
    getLocale(),
    getDeliveryContext(),
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
      choices={choices}
      addAddressHref={withLocale(ROUTES.addresses.path, locale)}
      locationCopy={locationCopy(food, common)}
      unavailable={unavailable}
    />
  );
}
