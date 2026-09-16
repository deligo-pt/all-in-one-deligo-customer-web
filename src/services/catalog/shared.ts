import { distanceKm, type DeliveryLocation } from "@/lib/location";
import { formatCurrency, formatNumber } from "@/lib/i18n/format";
import type { Locale } from "@/lib/i18n/locale";

/**
 * What every catalogue adapter shares (Phase 16): the raw shapes the API was
 * measured returning, and the three places a number becomes text.
 *
 * **Money is formatted here, once.** The API sends `finalPrice: 16` with
 * `currency: "€"`; the screens take a string and never touch it again. The
 * amount is the backend's — `finalPrice`, not `price` minus `discount`.
 */

export type RawVendor = {
  id?: string;
  _id?: string;
  userId?: string;
  businessDetails?: {
    businessName?: string;
    businessType?: string;
    restaurantCuisineType?: string[];
    openingHours?: string;
    closingHours?: string;
    /** English day names — "Friday" (measured). */
    closingDays?: string[];
    preparationTimeMinutes?: number;
    NIF?: string;
    companyLegalName?: string;
    isStoreOpen?: boolean;
  };
  businessLocation?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  };
  email?: string;
  contactNumber?: string;
  storePhoto?: string[];
  documents?: { storePhoto?: string[] };
  rating?: { average?: number; totalReviews?: number };
};

export type RawPricing = {
  price?: number;
  finalPrice?: number;
  discount?: number;
  discountType?: string;
  currency?: string;
};

export type RawProduct = {
  _id: string;
  name?: string;
  description?: string;
  images?: string[];
  pricing?: RawPricing;
  category?: { _id?: string; name?: string };
  variations?: {
    _id?: string;
    name?: string;
    options?: { label?: string; price?: number; sku?: string }[];
  }[];
  addonGroups?: string[];
  meta?: { status?: string };
};

const SYMBOLS: Record<string, string> = { "€": "EUR", $: "USD", "£": "GBP" };

/** The API sends a symbol ("€") or a code ("EUR"); Intl needs the code. */
export function currencyCode(value: string | undefined): string {
  if (!value) return "EUR";
  return SYMBOLS[value] ?? value.toUpperCase();
}

export function money(
  amount: number | undefined,
  currency: string | undefined,
  locale: Locale,
): string | undefined {
  return typeof amount === "number"
    ? formatCurrency(amount, locale, currencyCode(currency))
    : undefined;
}

/** The API's average, as sent — and nothing for a store nobody has rated. */
export function ratingText(rating: RawVendor["rating"]): string | undefined {
  return rating?.totalReviews && typeof rating.average === "number"
    ? String(rating.average)
    : undefined;
}

export function distanceText(
  from: DeliveryLocation | undefined,
  vendor: RawVendor,
  locale: Locale,
): string | undefined {
  const { latitude, longitude } = vendor.businessLocation ?? {};
  if (!from || typeof latitude !== "number" || typeof longitude !== "number")
    return undefined;
  return formatNumber(distanceKm(from, { latitude, longitude }), locale, {
    style: "unit",
    unit: "kilometer",
    maximumFractionDigits: 1,
  });
}

export function storePhoto(vendor: RawVendor): string | undefined {
  return vendor.storePhoto?.[0] ?? vendor.documents?.storePhoto?.[0];
}

/** Every page of a paginated list, up to a ceiling — the listing and a menu
 *  both render the whole set, and the API's default page is ten. */
export const PAGE_LIMIT = 100;
