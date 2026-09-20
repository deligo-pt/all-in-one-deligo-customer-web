import type {
  GroceryCatalog,
  GroceryProduct,
  GroceryStore,
} from "@/features/groceries";
import { getLocale, getTranslations } from "@/i18n/server";
import { formatNumber } from "@/lib/i18n/format";
import { serverApi } from "@/services/api/server";
import { groupMenu, toVendor, vendorProducts } from "./food";
import { PAGE_LIMIT, storePhoto, type RawVendor } from "./shared";

/**
 * The grocery catalogue (Phase 16). A store is a vendor whose business type is
 * `STORE`; its aisles are its own product categories, exactly as a
 * restaurant's menu sections are — so the food adapter's mappers do the work.
 */
export async function groceryCatalog(): Promise<GroceryCatalog> {
  const [food, t, locale] = await Promise.all([
    getTranslations("food"),
    getTranslations("groceries"),
    getLocale(),
  ]);
  const context = { t: food, locale };

  return {
    async listStores({ location, term }) {
      const api = await serverApi();
      const { data } = await api.get("/vendors/nearby/open", {
        params: {
          latitude: location.latitude,
          longitude: location.longitude,
          businessType: "STORE",
          limit: PAGE_LIMIT,
          // The business name, matched by the API (Phase 20c).
          ...(term ? { searchTerm: term } : {}),
        },
      });
      const stores = ((data?.data ?? []) as RawVendor[]).map((v) =>
        toVendor(v, context, location),
      );
      const total = data?.meta?.total;
      return {
        shelves: [{ id: "all", title: t("allStores"), stores }],
        countLabel: typeof total === "number" ? formatNumber(total, locale) : undefined,
      };
    },

    async getStore(storeId) {
      const api = await serverApi();
      const { data: detail } = await api.get(
        `/vendors/nearby/open/${encodeURIComponent(storeId)}`,
      );
      const raw = detail?.data as (RawVendor & { _id: string }) | undefined;
      if (!raw?._id) throw new Error("store-missing");
      const [products, categories] = await Promise.all([
        vendorProducts(raw._id),
        api.get("/product-categories/open", {
          params: { vendorId: raw._id, page: 1, limit: PAGE_LIMIT },
        }),
      ]);
      const reviews = raw.rating?.totalReviews ?? 0;
      const place = raw.businessLocation ?? {};
      const aisles = groupMenu(categories.data?.data ?? [], products, context).map(
        (section) => ({
          id: section.id,
          name: section.name,
          // The API has no unit field; a store writes "1kg (approx. 6 units)"
          // in the description, which is where the design's second line reads.
          products: section.items.map((item): GroceryProduct => ({
            id: item.id,
            name: item.name,
            unit: item.description,
            price: item.price,
            image: item.image,
          })),
        }),
      );
      return {
        ...toVendor(raw, context),
        recordId: raw._id,
        address: [place.street, place.city].filter(Boolean).join(", ") || undefined,
        reviewsLabel: reviews
          ? food.plural("reviewsCount", reviews, {
              count: formatNumber(reviews, locale),
            })
          : undefined,
        heroImage: storePhoto(raw),
        deals: [],
        aisles,
      } satisfies GroceryStore;
    },
  };
}
