import type { Metadata } from "next";
import {
  SearchFilterBar,
  SearchResults,
  type SearchCuisine,
  type SearchPage,
  type SearchPlaces,
} from "@/features/search";
import { getLocale, getTranslations } from "@/i18n/server";
import { formatNumber } from "@/lib/i18n/format";
import { withLocale } from "@/lib/i18n/path";
import { ROUTES } from "@/lib/routes";
import { foodCatalog } from "@/services/catalog/food";
import { groceryCatalog } from "@/services/catalog/groceries";
import {
  MIN_SEARCH_LENGTH,
  SEARCH_PAGE_SIZE,
  isSearchSort,
  searchDishes,
  type SearchSort,
} from "@/services/catalog/search";
import { getDeliveryLocation } from "@/services/location/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("food");
  return { title: t("searchHeading") };
}

type Param = string | string[] | undefined;

const one = (value: Param) => (typeof value === "string" ? value.trim() : "");

/** A price the API will accept: finite and not negative. `minPrice=abc`
 *  answers 500 with the raw search-engine error, so it never leaves here. */
function price(value: Param): number | undefined {
  const raw = one(value);
  if (!raw) return undefined;
  const parsed = Number(raw.replace(",", "."));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

/**
 * `/search?q=&page=&sort=&cuisine=&min=&max=&halal=` — the header's search box
 * lands here (Phase 16; places, sort and filters in Phase 20c).
 *
 * Every control is a URL parameter the server applies, so a filtered search
 * can be shared, reloaded and paged. Nothing is filtered or reordered here
 * afterwards: what the API ranks is what renders (§2.2).
 */
export default async function SearchRoute({
  searchParams,
}: {
  searchParams: Promise<{
    q?: Param;
    page?: Param;
    sort?: Param;
    cuisine?: Param;
    min?: Param;
    max?: Param;
    halal?: Param;
  }>;
}) {
  const [t, locale, query, location] = await Promise.all([
    getTranslations("food"),
    getLocale(),
    searchParams,
    getDeliveryLocation(),
  ]);

  const term = one(query.q);
  const page = Math.max(
    1,
    Math.floor(Math.abs(parseInt(one(query.page) || "1", 10))) || 1,
  );
  const sort: SearchSort = isSearchSort(query.sort) ? query.sort : "relevance";
  const cuisine = one(query.cuisine);
  const minPrice = price(query.min);
  const maxPrice = price(query.max);
  const halal = one(query.halal) === "1";

  let result: SearchPage = { results: [], total: 0 };
  let places: SearchPlaces | undefined;
  let cuisines: readonly SearchCuisine[] = [];
  let state: "prompt" | "results" | "unavailable" = "prompt";

  if (term.length >= MIN_SEARCH_LENGTH) {
    const [dishes, restaurants, stores, cuisineList] = await Promise.allSettled([
      searchDishes({ term, page, sort, cuisine, minPrice, maxPrice, halal }),
      // Places need somewhere to be near: `/vendors/nearby/open` is a
      // proximity list first and a name search second.
      location
        ? (await foodCatalog()).listVendors({ term, location })
        : Promise.resolve(null),
      location
        ? (await groceryCatalog()).listStores({ term, location })
        : Promise.resolve(null),
      (await foodCatalog()).listCuisines(),
    ]);

    if (dishes.status === "fulfilled") {
      result = dishes.value;
      state = "results";
    } else {
      state = "unavailable";
    }
    // A place list that fails is a missing section, not a failed search.
    const matched = {
      restaurants:
        restaurants.status === "fulfilled" && restaurants.value
          ? restaurants.value.vendors
          : [],
      stores:
        stores.status === "fulfilled" && stores.value
          ? stores.value.shelves.flatMap((shelf) => shelf.stores)
          : [],
    };
    if (location) places = matched;
    if (cuisineList.status === "fulfilled") {
      cuisines = cuisineList.value.map((item) => ({ id: item.id, name: item.name }));
    }
  }

  const base = withLocale(ROUTES.search.path, locale);
  const link = (p: number) => {
    const params = new URLSearchParams({ q: term });
    if (sort !== "relevance") params.set("sort", sort);
    if (cuisine) params.set("cuisine", cuisine);
    if (minPrice !== undefined) params.set("min", String(minPrice));
    if (maxPrice !== undefined) params.set("max", String(maxPrice));
    if (halal) params.set("halal", "1");
    if (p > 1) params.set("page", String(p));
    return `${base}?${params.toString()}`;
  };
  const hasNext = page * SEARCH_PAGE_SIZE < result.total;

  return (
    <SearchResults
      state={state}
      results={result.results}
      places={places}
      locale={locale}
      previousHref={state === "results" && page > 1 ? link(page - 1) : undefined}
      nextHref={state === "results" && hasNext ? link(page + 1) : undefined}
      filters={
        <SearchFilterBar
          action={base}
          values={{
            term,
            sort,
            cuisine,
            minPrice: minPrice === undefined ? "" : String(minPrice),
            maxPrice: maxPrice === undefined ? "" : String(maxPrice),
            halal,
          }}
          cuisines={cuisines}
          clearHref={`${base}?q=${encodeURIComponent(term)}`}
          copy={{
            legend: t("filterLegend"),
            sort: t("sortLabel"),
            sortOption: {
              relevance: t("sortRelevance"),
              "price-asc": t("sortPriceAsc"),
              "price-desc": t("sortPriceDesc"),
              "rating-desc": t("sortRating"),
            },
            cuisine: t("cuisineLabel"),
            anyCuisine: t("cuisineAny"),
            minPrice: t("minPrice"),
            maxPrice: t("maxPrice"),
            halal: t("halalOnly"),
            apply: t("applyFilters"),
            clear: t("clearFilters"),
          }}
        />
      }
      copy={{
        title: term ? t("searchTitle", { query: term }) : t("searchHeading"),
        count: t.plural("searchCount", result.total, {
          count: formatNumber(result.total, locale),
        }),
        prompt: t("searchPrompt", { min: MIN_SEARCH_LENGTH }),
        emptyTitle: t("searchEmpty", { query: term }),
        emptyBody: t("searchEmptyBody"),
        unavailableTitle: t("searchUnavailable"),
        unavailableBody: t("searchUnavailableBody"),
        outOfStock: t("outOfStock"),
        previous: t("previousPage"),
        next: t("nextPage"),
        rating: t("rating"),
        restaurants: t("searchRestaurants"),
        stores: t("searchStores"),
        dishes: t("searchDishes"),
        vendorImage: t("vendorImage"),
      }}
    />
  );
}
