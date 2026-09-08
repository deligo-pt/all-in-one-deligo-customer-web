"use client";

import { useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import type { Locale } from "@/lib/i18n/locale";
import { CuisineRow } from "./CuisineRow";
import { DeliveryBar } from "./DeliveryBar";
import { FilterPanel, type FilterCopy } from "./FilterPanel";
import { VendorCard } from "./VendorCard";
import { EMPTY_FILTERS, type Cuisine, type FoodFilters, type Vendor } from "./types";

export type ListingCopy = {
  filters: FilterCopy;
  deliveringTo: string;
  change: string;
  setAddress: string;
  availability: string;
  favouriteCuisines: string;
  allRestaurants: string;
  vendorImage: string;
  rating: string;
  emptyTitle: string;
  emptyBody: string;
  unavailableTitle: string;
  unavailableBody: string;
};

/**
 * The restaurant listing: a 312px filter rail and a 977px column beside it.
 *
 * Measured from `food Home` at 1553px — rail and column on a 1312 container
 * with a 24px gutter, the delivery bar, a promotional banner, the cuisine row,
 * then "All Restaurant" as a three-column grid on 32px gaps.
 *
 * ## The filters are real and filter nothing
 *
 * State is held here and passed to the catalogue in Phase 16, where the API
 * does the work — `/vendors/nearby/open` takes the query, and a frontend that
 * filtered a page of results locally would produce a different answer from the
 * one the backend gives, on a list that is paginated. So the controls are
 * built, operable and keyboard-complete now; what they are wired to comes
 * later. "Reset All" is the exception: it needs no backend and already works.
 *
 * ## Two empty states, not one
 *
 * "No restaurants match these filters" and "the catalogue is not connected"
 * are different sentences and different fixes. Collapsing them is how a
 * customer ends up clearing filters that were never the problem.
 */
export function VendorListing({
  locale,
  vendors,
  cuisines,
  facets,
  copy,
  address,
  countLabel,
  unavailable = false,
}: {
  locale: Locale;
  vendors: readonly Vendor[];
  cuisines: readonly Cuisine[];
  facets: {
    deals: readonly { id: string; label: string }[];
    dietary: readonly { id: string; label: string }[];
    cuisines: readonly { id: string; label: string }[];
  };
  copy: ListingCopy;
  address?: string;
  countLabel?: string;
  /** The catalogue could not be read at all — distinct from "no matches". */
  unavailable?: boolean;
}) {
  const [filters, setFilters] = useState<FoodFilters>(EMPTY_FILTERS);

  return (
    <div className="max-w-shell mx-auto flex w-full flex-col gap-6 px-8 py-8 lg:flex-row">
      <FilterPanel
        value={filters}
        onChange={setFilters}
        copy={copy.filters}
        deals={facets.deals}
        dietary={facets.dietary}
        cuisines={facets.cuisines}
        className="w-full lg:w-78 lg:shrink-0"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-8">
        <DeliveryBar
          address={address}
          countLabel={countLabel}
          deliveringToLabel={copy.deliveringTo}
          changeLabel={copy.change}
          setAddressLabel={copy.setAddress}
          availabilityLabel={copy.availability}
        />

        {cuisines.length ? (
          <section className="flex flex-col gap-6">
            <h2 className="text-20 text-ink font-semibold">{copy.favouriteCuisines}</h2>
            <CuisineRow
              cuisines={cuisines}
              selected={filters.cuisines}
              onToggle={(id) =>
                setFilters((current) => ({
                  ...current,
                  cuisines: current.cuisines.includes(id)
                    ? current.cuisines.filter((x) => x !== id)
                    : [...current.cuisines, id],
                }))
              }
            />
          </section>
        ) : null}

        <section className="flex flex-col gap-6">
          <h2 className="text-20 text-ink font-semibold">{copy.allRestaurants}</h2>

          {unavailable ? (
            <EmptyState
              icon={<Icon name="shop" className="size-8" />}
              title={copy.unavailableTitle}
              description={copy.unavailableBody}
            />
          ) : vendors.length === 0 ? (
            <EmptyState
              icon={<Icon name="search" className="size-8" />}
              title={copy.emptyTitle}
              description={copy.emptyBody}
            />
          ) : (
            <ul className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
              {vendors.map((vendor) => (
                <li key={vendor.id}>
                  <VendorCard
                    vendor={vendor}
                    locale={locale}
                    imageLabel={copy.vendorImage}
                    ratingLabel={copy.rating}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
