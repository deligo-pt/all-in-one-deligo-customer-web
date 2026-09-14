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
