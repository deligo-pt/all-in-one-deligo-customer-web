import type { Metadata } from "next";
import { SearchResults, type SearchPage } from "@/features/search";
import { getLocale, getTranslations } from "@/i18n/server";
import { formatNumber } from "@/lib/i18n/format";
import { withLocale } from "@/lib/i18n/path";
import { ROUTES } from "@/lib/routes";
import {
  MIN_SEARCH_LENGTH,
  SEARCH_PAGE_SIZE,
  searchDishes,
} from "@/services/catalog/search";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("food");
  return { title: t("searchHeading") };
}

/** `/search?q=&page=` — the header's search box lands here (Phase 16). */
export default async function SearchRoute({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; page?: string | string[] }>;
}) {
  const [t, locale, query] = await Promise.all([
    getTranslations("food"),
    getLocale(),
    searchParams,
  ]);
  const term = (typeof query.q === "string" ? query.q : "").trim();
  const page = Math.max(
    1,
    Math.floor(
      Math.abs(parseInt(typeof query.page === "string" ? query.page : "1", 10)),
    ) || 1,
  );

  let result: SearchPage = { results: [], total: 0 };
  let state: "prompt" | "results" | "unavailable" = "prompt";
  if (term.length >= MIN_SEARCH_LENGTH) {
    try {
      result = await searchDishes(term, page);
      state = "results";
    } catch {
      state = "unavailable";
    }
  }

  const base = withLocale(ROUTES.search.path, locale);
  const link = (p: number) =>
    `${base}?q=${encodeURIComponent(term)}${p > 1 ? `&page=${p}` : ""}`;
  const hasNext = page * SEARCH_PAGE_SIZE < result.total;

  return (
    <SearchResults
      state={state}
      results={result.results}
      previousHref={state === "results" && page > 1 ? link(page - 1) : undefined}
      nextHref={state === "results" && hasNext ? link(page + 1) : undefined}
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
      }}
    />
  );
}
