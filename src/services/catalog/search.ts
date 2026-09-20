import type { SearchPage } from "@/features/search";
import { getLocale } from "@/i18n/server";
import { withLocale } from "@/lib/i18n/path";
import { ROUTES } from "@/lib/routes";
import { serverApi } from "@/services/api/server";
import { money } from "./shared";

export const SEARCH_PAGE_SIZE = 20;
export const MIN_SEARCH_LENGTH = 2;

/**
 * How the results are ordered, and what each choice sends (Phase 20c).
 *
 * `price` and `rating` are the only fields `GET /search` sorts on — measured
 * 16 Sep 2026, and the old app's audit found the same two. The direction is
 * always sent explicitly: the server's own default is descending for both,
 * which for price means the €100 burger first, which is not what "sort by
 * price" means to anyone.
 *
 * Sorting happens **within** the API's relevance groups, not across them: an
 * exact-name match still comes before a fuzzy one, cheaper or not. That is the
 * search engine's ranking and we render what it returns (§2.2 — the API
 * decides the order).
 *
 * Distance is **not** a sort the API offers. It is in the Phase 21 spec with
 * the rest of D-18 rather than in a control that would change nothing.
 */
export const SEARCH_SORTS = {
  relevance: {},
  "price-asc": { sortBy: "price", sortOrder: "asc" },
  "price-desc": { sortBy: "price", sortOrder: "desc" },
  "rating-desc": { sortBy: "rating", sortOrder: "desc" },
} as const;

export type SearchSort = keyof typeof SEARCH_SORTS;

export const isSearchSort = (value: unknown): value is SearchSort =>
  typeof value === "string" && value in SEARCH_SORTS;

/** Everything the results page can narrow by, all of it server-applied. */
export type SearchQuery = {
  term: string;
  page: number;
  sort: SearchSort;
  /** A cuisine **slug** from `/categories/cuisine/open`; a name matches none. */
  cuisine?: string;
  minPrice?: number;
  maxPrice?: number;
  halal?: boolean;
};

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
export async function searchDishes(query: SearchQuery): Promise<SearchPage> {
  const [api, locale] = await Promise.all([serverApi(), getLocale()]);
  const { data } = await api.get("/search", {
    params: {
      searchTerm: query.term,
      limit: SEARCH_PAGE_SIZE,
      offset: (query.page - 1) * SEARCH_PAGE_SIZE,
      ...SEARCH_SORTS[query.sort],
      ...(query.cuisine ? { cuisine: query.cuisine } : {}),
      // `minPrice=abc` answers 500 with the raw search-engine error, so only a
      // finite number is ever sent (the old app's audit, re-measured).
      ...(query.minPrice !== undefined ? { minPrice: query.minPrice } : {}),
      ...(query.maxPrice !== undefined ? { maxPrice: query.maxPrice } : {}),
      ...(query.halal ? { isHalal: true } : {}),
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
