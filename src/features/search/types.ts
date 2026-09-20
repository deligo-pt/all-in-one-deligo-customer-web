import type { Vendor } from "@/features/food";

/** One dish in the results — the API's ranking, the API's words (Phase 16). */
export type SearchResult = {
  id: string;
  name: string;
  description?: string;
  restaurantName: string;
  /** The restaurant page. The hit carries the vendor's Mongo `_id`; the page
   *  resolves it to the canonical `userId` URL. */
  href: string;
  /** Formatted once from the hit's `price` and `currency`. */
  price: string;
  rating?: string;
  image?: string;
  available: boolean;
};

export type SearchPage = {
  results: readonly SearchResult[];
  /** The API's `estimatedTotalHits`, not the length of this page. */
  total: number;
};

/**
 * A place that matches the name — a restaurant or a grocery store near the
 * delivery location (Phase 20c).
 *
 * The search index holds **food items only**: there are no store documents to
 * match against, which is why the old app dropped its own "Places" section.
 * These come from `/vendors/nearby/open?searchTerm=`, which does match a
 * business name (measured 16 Sep 2026) — so places need a location, and
 * without one the section is absent rather than empty.
 */
export type SearchPlaces = {
  restaurants: readonly Vendor[];
  stores: readonly Vendor[];
};
