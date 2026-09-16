import type {
  Cuisine,
  FoodCatalog,
  MenuCategory,
  MenuItem,
  OptionGroup,
  Vendor,
  StoreDetails,
  VendorDetail,
} from "@/features/food";
import { getLocale, getTranslations } from "@/i18n/server";
import type { Translator } from "@/i18n/translator";
import type { Locale } from "@/lib/i18n/locale";
import { formatNumber } from "@/lib/i18n/format";
import type { DeliveryLocation } from "@/lib/location";
import { hasServerSession, serverApi } from "@/services/api/server";
import {
  PAGE_LIMIT,
  distanceText,
  money,
  ratingText,
  storePhoto,
  type RawProduct,
  type RawVendor,
} from "./shared";

type Context = { t: Translator<"food">; locale: Locale };

export function toVendor(
  raw: RawVendor,
  { t, locale }: Context,
  from?: DeliveryLocation,
): Vendor {
  const b = raw.businessDetails ?? {};
  const open = b.isStoreOpen === true;
  return {
    id: raw.userId ?? "",
    name: b.businessName ?? "",
    image: storePhoto(raw),
    cuisines: b.restaurantCuisineType ?? [],
    rating: ratingText(raw.rating),
    distance: distanceText(from, raw, locale),
    status: open ? "open" : "closed",
    // The hours are the vendor's own strings, placed in our sentence.
    statusDetail: open
      ? b.closingHours
        ? t("openUntil", { time: b.closingHours })
        : undefined
      : b.openingHours
        ? t("closedOpensAt", { time: b.openingHours })
        : undefined,
  };
}

export function toMenuItem(raw: RawProduct, { t, locale }: Context): MenuItem {
  const p = raw.pricing ?? {};
  const discounted = (p.discount ?? 0) > 0 && p.finalPrice !== p.price;
  const options: OptionGroup[] = (raw.variations ?? []).map((v, index) => ({
    id: v._id ?? `variation-${index}`,
    name: v.name ?? "",
    minSelectable: 1,
    maxSelectable: 1,
    choices: (v.options ?? []).map((o, i) => ({
      id: o.sku ?? `${index}-${i}`,
      name: o.label ?? "",
      priceDelta: money(o.price, p.currency, locale),
    })),
  }));
  return {
    id: raw._id,
    name: raw.name ?? "",
    description: raw.description || undefined,
    image: raw.images?.[0],
    price: money(p.finalPrice ?? p.price, p.currency, locale) ?? "",
    originalPrice: discounted ? money(p.price, p.currency, locale) : undefined,
    badge: discounted
      ? p.discountType === "FLAT"
        ? t("amountOff", { value: money(p.discount, p.currency, locale) ?? "" })
        : t("percentOff", { value: String(p.discount) })
      : undefined,
    options: options.length ? options : undefined,
    addonGroupIds: raw.addonGroups?.length ? raw.addonGroups : undefined,
  };
}

/**
 * A menu, in sections — the old app's `groupByVendorCategories`.
 *
 * The vendor's own categories (`/product-categories/open`) come first, in the
 * order the API returns them. Any active product filed elsewhere — a shared
 * category, or none — goes into one "Other" section, always last, so an
 * unfiled product can never push a stray heading to the top of a storefront.
 * No active product is dropped (`V-IN0AMES9` has no categories of its own).
 */
export const OTHER_SECTION_ID = "other";

export function groupMenu(
  categories: readonly { _id: string; name?: string }[],
  products: readonly RawProduct[],
  context: Context,
): MenuCategory[] {
  const live = products.filter((p) => (p.meta?.status ?? "ACTIVE") === "ACTIVE");
  const sections = new Map<string, MenuCategory & { items: MenuItem[] }>();
  for (const category of categories) {
    sections.set(category._id, {
      id: category._id,
      name: category.name ?? "",
      items: [],
    });
  }
  const other: MenuItem[] = [];
  for (const product of live) {
    const section = product.category?._id
      ? sections.get(product.category._id)
      : undefined;
    if (section) section.items.push(toMenuItem(product, context));
    else other.push(toMenuItem(product, context));
  }
  const menu = [...sections.values()].filter((section) => section.items.length > 0);
  if (other.length) {
    menu.push({ id: OTHER_SECTION_ID, name: context.t("otherCategory"), items: other });
  }
  return menu;
}

/**
 * A vendor's products — the old app's split. Signed in, `/products` (the
 * authenticated list); a guest, `/products/open`. They are not the same list:
 * for `V-IN0AMES9` the open list holds 2 of the 9 products the search index
 * has. A session the API refuses falls back to the open list.
 */
export async function vendorProducts(vendorMongoId: string): Promise<RawProduct[]> {
  const api = await serverApi();
  const params = { vendorId: vendorMongoId, page: 1, limit: PAGE_LIMIT };
  if (await hasServerSession()) {
    try {
      const { data } = await api.get("/products", { params });
      return (data?.data ?? []) as RawProduct[];
    } catch {
      // Fall through to the public menu.
    }
  }
  const { data } = await api.get("/products/open", { params });
  return (data?.data ?? []) as RawProduct[];
}

/**
 * The store's own facts for the details dialog (Phase 20d).
 *
 * Joined and phrased here, once, because the dialog is a client component and
 * the server is where the translator lives. Anything the API did not send is
 * left out — a missing telephone is a store without one on file, not an error
 * to report to the customer.
 *
 * The day names are the API's English ones (`"Friday"`, measured); they are
 * translated through the `day…` keys, and a day we do not recognise is shown
 * as it came rather than dropped.
 */
const dayNames = ({ t }: Context): Record<string, string> => ({
  monday: t("dayMonday"),
  tuesday: t("dayTuesday"),
  wednesday: t("dayWednesday"),
  thursday: t("dayThursday"),
  friday: t("dayFriday"),
  saturday: t("daySaturday"),
  sunday: t("daySunday"),
});

function storeDetails(raw: RawVendor, context: Context): StoreDetails {
  const business = raw.businessDetails ?? {};
  const place = raw.businessLocation ?? {};
  const minutes = business.preparationTimeMinutes;
  return {
    hours:
      business.openingHours && business.closingHours
        ? `${business.openingHours} – ${business.closingHours}`
        : undefined,
    closingDays: (business.closingDays ?? []).map(
      // Spelled-out keys, above: a key nobody writes is a key `verify:i18n`
      // calls unused and deletes. A day we cannot place is shown as it came.
      (day) => dayNames(context)[day.trim().toLowerCase()] ?? day,
    ),
    preparation:
      typeof minutes === "number" && minutes > 0
        ? context.t("preparationMinutes", {
            count: formatNumber(minutes, context.locale),
          })
        : undefined,
    address:
      [place.street, place.city, place.postalCode, place.country]
        .map((part) => part?.trim())
        .filter(Boolean)
        .join(", ") || undefined,
    phone: raw.contactNumber || undefined,
    email: raw.email || undefined,
    nif: business.NIF || undefined,
    legalName: business.companyLegalName || undefined,
    position:
      typeof place.latitude === "number" && typeof place.longitude === "number"
        ? { latitude: place.latitude, longitude: place.longitude }
        : undefined,
  };
}

/** The food catalogue for this request — its language, its session. */
export async function foodCatalog(): Promise<FoodCatalog> {
  const [t, locale] = await Promise.all([getTranslations("food"), getLocale()]);
  const context: Context = { t, locale };
  return {
    async listVendors({ cuisine, term, location }) {
      const api = await serverApi();
      const { data } = await api.get("/vendors/nearby/open", {
        params: {
          latitude: location.latitude,
          longitude: location.longitude,
          businessType: "RESTAURANT",
          limit: PAGE_LIMIT,
          // One cuisine: the API matches a single slug, and ignores a list.
          ...(cuisine ? { restaurantCuisineType: cuisine } : {}),
          // The business name, matched by the API (Phase 20c): measured, a
          // term that matches nothing returns none rather than everything.
          ...(term ? { searchTerm: term } : {}),
        },
      });
      const raw = (data?.data ?? []) as RawVendor[];
      const total = data?.meta?.total;
      return {
        vendors: raw.map((v) => toVendor(v, context, location)),
        countLabel:
          typeof total === "number" ? formatNumber(total, context.locale) : undefined,
      };
    },

    async listCuisines() {
      const api = await serverApi();
      const { data } = await api.get("/categories/cuisine/open", {
        params: { limit: PAGE_LIMIT },
      });
      return (
        (data?.data ?? []) as { slug?: string; name?: string; imageUrl?: string }[]
      )
        .filter((c) => c.slug)
        .map((c): Cuisine => ({
          id: c.slug!,
          name: c.name ?? c.slug!,
          image: c.imageUrl,
        }));
    },

    async getVendor(vendorId) {
      const api = await serverApi();
      const { data: detail } = await api.get(
        `/vendors/nearby/open/${encodeURIComponent(vendorId)}`,
      );
      const raw = detail?.data as (RawVendor & { _id: string }) | undefined;
      if (!raw?._id) throw new Error("vendor-missing");

      const [products, categories] = await Promise.all([
        vendorProducts(raw._id),
        api.get("/product-categories/open", {
          params: { vendorId: raw._id, page: 1, limit: PAGE_LIMIT },
        }),
      ]);
      const vendor = toVendor(raw, context);
      const reviews = raw.rating?.totalReviews ?? 0;
      const place = raw.businessLocation ?? {};
      return {
        ...vendor,
        recordId: raw._id,
        address: [place.street, place.city].filter(Boolean).join(", ") || undefined,
        reviewsLabel: reviews
          ? context.t.plural("reviewsCount", reviews, {
              count: formatNumber(reviews, context.locale),
            })
          : undefined,
        heroImage: storePhoto(raw),
        details: storeDetails(raw, context),
        closing: {
          closingHours: raw.businessDetails?.closingHours,
          closingDays: raw.businessDetails?.closingDays ?? [],
        },
        // `/offers` needs a session and is not scoped to one vendor; the
        // vendor's deals arrive with the checkout work (Phase 18).
        deals: [],
        menu: groupMenu(categories.data?.data ?? [], products, context),
      } satisfies VendorDetail;
    },
  };
}

/**
 * Resolves a search hit's `restaurantId` (a Mongo `_id`) to the `userId` the
 * vendor page needs, through one of the vendor's own products.
 */
export async function vendorUserIdFromMongoId(mongoId: string): Promise<string | null> {
  const api = await serverApi();
  const { data } = await api.get("/products/open", {
    params: { vendorId: mongoId, page: 1, limit: 1 },
  });
  const owner = (data?.data?.[0] as { vendorId?: { userId?: string } } | undefined)
    ?.vendorId;
  return owner?.userId ?? null;
}
