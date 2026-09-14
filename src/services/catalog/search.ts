import type { SearchPage } from "@/features/search";
import { getLocale } from "@/i18n/server";
import { withLocale } from "@/lib/i18n/path";
import { ROUTES } from "@/lib/routes";
import { serverApi } from "@/services/api/server";
import { money } from "./shared";

export const SEARCH_PAGE_SIZE = 20;
export const MIN_SEARCH_LENGTH = 2;

type RawHit = {
  id: string;
  name?: string;
  description?: string;
  restaurantName?: string;
  branchName?: string;
  restaurantId?: string;
  price?: number;
  currency?: string;
  rating?: number;
  isAvailable?: boolean;
  thumbnail?: string | null;
};

/**
 * `GET /search?searchTerm=` — ranked dishes (Phase 16). The parameter is
 * `searchTerm`; `q` and `search` are ignored by the API (the old app's audit).
 */
export async function searchDishes(term: string, page: number): Promise<SearchPage> {
  const [api, locale] = await Promise.all([serverApi(), getLocale()]);
  const { data } = await api.get("/search", {
    params: {
      searchTerm: term,
      limit: SEARCH_PAGE_SIZE,
      offset: (page - 1) * SEARCH_PAGE_SIZE,
    },
  });
  const hits = (data?.data?.hits ?? []) as RawHit[];
  return {
    total:
      typeof data?.data?.estimatedTotalHits === "number"
        ? data.data.estimatedTotalHits
        : hits.length,
    results: hits.map((hit) => ({
      id: hit.id,
      name: hit.name ?? "",
      description: hit.description || undefined,
      restaurantName: [hit.restaurantName, hit.branchName].filter(Boolean).join(" · "),
      href: withLocale(
        ROUTES.vendor.path.replace("[vendorId]", hit.restaurantId ?? ""),
        locale,
      ),
      price: money(hit.price, hit.currency, locale) ?? "",
      rating: hit.rating ? String(hit.rating) : undefined,
      image: hit.thumbnail ?? undefined,
      available: hit.isAvailable !== false,
    })),
  };
}
