import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { ImageSlot } from "@/components/shared/ImageSlot";
import type { SearchResult } from "./types";

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
};

/**
 * `/search` — the design has no search screen, so this is the listing's grid
 * with dish cards in the menu card's type scale (Phase 16). Results render in
 * the server's order; paging is links, so a result page can be shared.
 */
export function SearchResults({
  results,
  copy,
  state,
  previousHref,
  nextHref,
}: {
  results: readonly SearchResult[];
  copy: SearchCopy;
  state: "prompt" | "results" | "unavailable";
  previousHref?: string;
  nextHref?: string;
}) {
  return (
    <div className="max-w-shell mx-auto flex w-full flex-col gap-8 px-8 py-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-32 text-ink font-semibold">{copy.title}</h1>
        {state === "results" && copy.count ? (
          <p className="text-16 text-ink-muted">{copy.count}</p>
        ) : null}
      </header>

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
