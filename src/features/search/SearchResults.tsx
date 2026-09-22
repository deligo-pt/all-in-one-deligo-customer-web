import Link from "next/link";
import type { ReactNode } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { ImageSlot } from "@/components/shared/ImageSlot";
import { VendorCard } from "@/features/food";
import type { Locale } from "@/lib/i18n/locale";
import { withLocale } from "@/lib/i18n/path";
import { ROUTES } from "@/lib/routes";
import type { SearchPlaces, SearchResult } from "./types";

export type SearchCopy = {
  title: string;
  count?: string;
  prompt: string;
  emptyTitle: string;
  emptyBody: string;
  unavailableTitle: string;
  unavailableBody: string;
  outOfStock: string;
  previous: string;
  next: string;
  rating: string;
  /** "Restaurants", "Stores", "Dishes" — the three groups (Phase 20c). */
  restaurants: string;
  stores: string;
  dishes: string;
  vendorImage: string;
};

/**
 * `/search` — the design has no search screen, so this is the listing's grid
 * with dish cards in the menu card's type scale (Phase 16). Results render in
 * the server's order; paging is links, so a result page can be shared.
 *
 * **Places first, then dishes** (Phase 20c). Someone typing "Tasca" usually
 * wants the restaurant, not its chicken soup, and the two come from two
 * different endpoints — the store from the nearby-vendors list, the dishes
 * from the search index, which holds no store documents at all. Places are
 * absent, not empty, when there is no delivery location to look near.
 */
export function SearchResults({
  results,
  places,
  locale,
  filters,
  copy,
  state,
  previousHref,
  nextHref,
}: {
  results: readonly SearchResult[];
  /** Matching restaurants and stores; absent without a delivery location. */
  places?: SearchPlaces;
  locale: Locale;
  /** The filter bar, rendered above the groups. */
  filters?: ReactNode;
  copy: SearchCopy;
  state: "prompt" | "results" | "unavailable";
  previousHref?: string;
  nextHref?: string;
}) {
  // The two kinds of place, each with the route its cards lead to: a store's
  // page is not the restaurant page, and the card takes the href it is given.
  const placeGroups = (
    [
      [copy.restaurants, places?.restaurants ?? [], undefined],
      [copy.stores, places?.stores ?? [], ROUTES.groceryStore.path],
    ] as const
  ).filter(([, rows]) => rows.length > 0);
  return (
    <div className="max-w-shell mx-auto flex w-full flex-col gap-8 px-4 sm:px-8 py-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-32 text-ink font-semibold">{copy.title}</h1>
        {state === "results" && copy.count ? (
          <p className="text-16 text-ink-muted">{copy.count}</p>
        ) : null}
      </header>

      {state === "results" && filters ? filters : null}

      {state === "results" && placeGroups.length > 0
        ? placeGroups.map(([title, rows, storePath]) => (
            <section key={title} className="flex flex-col gap-6">
              <h2 className="text-24 text-ink font-semibold">{title}</h2>
              <ul className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                {rows.map((vendor) => (
                  <li key={vendor.id}>
                    <VendorCard
                      vendor={vendor}
                      locale={locale}
                      href={
                        storePath
                          ? withLocale(
                              storePath.replace("[storeId]", vendor.id),
                              locale,
                            )
                          : undefined
                      }
                      imageLabel={copy.vendorImage}
                      ratingLabel={copy.rating}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))
        : null}

      {state === "results" && placeGroups.length > 0 && results.length > 0 ? (
        <h2 className="text-24 text-ink font-semibold">{copy.dishes}</h2>
      ) : null}

      {state === "prompt" ? (
        <EmptyState
          icon={<Icon name="search" className="size-8" />}
          title={copy.prompt}
        />
      ) : state === "unavailable" ? (
        <EmptyState
          icon={<Icon name="alert" className="size-8" />}
          title={copy.unavailableTitle}
          description={copy.unavailableBody}
        />
      ) : results.length === 0 ? (
        <EmptyState
          icon={<Icon name="search" className="size-8" />}
          title={copy.emptyTitle}
          description={copy.emptyBody}
        />
      ) : (
        <>
          <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((result) => (
              <li key={result.id}>
                <Link
                  href={result.href}
                  className="border-line rounded-16 bg-surface flex h-full gap-4 border p-4 transition-shadow hover:shadow-md"
                >
                  <ImageSlot
                    src={result.image}
                    alt={result.name}
                    sizes="112px"
                    className="rounded-8 size-28 shrink-0"
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <h2 className="text-16 text-ink font-medium">{result.name}</h2>
                    <p className="text-14 text-ink-muted">{result.restaurantName}</p>
                    {result.description ? (
                      <p className="text-14 text-ink-muted line-clamp-2">
                        {result.description}
                      </p>
                    ) : null}
                    <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                      <p className="text-16 text-brand font-semibold">{result.price}</p>
                      {result.available ? (
                        result.rating ? (
                          <span
                            className="text-12 text-ink inline-flex items-center gap-1 font-medium"
                            aria-label={`${copy.rating} ${result.rating}`}
                          >
                            <Icon name="star" className="text-brand size-4" />
                            {result.rating}
                          </span>
                        ) : null
                      ) : (
                        <span className="text-12 text-danger font-medium">
                          {copy.outOfStock}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          {previousHref || nextHref ? (
            <nav className="flex justify-between gap-4">
              {previousHref ? (
                <Link className="text-16 text-brand font-medium" href={previousHref}>
                  {copy.previous}
                </Link>
              ) : (
                <span />
              )}
              {nextHref ? (
                <Link className="text-16 text-brand font-medium" href={nextHref}>
                  {copy.next}
                </Link>
              ) : null}
            </nav>
          ) : null}
        </>
      )}
    </div>
  );
}
