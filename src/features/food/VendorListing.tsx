"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import dynamic from "next/dynamic";
import type { LocationModalCopy } from "@/components/shared/LocationModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/locale";
import { CuisineRow } from "./CuisineRow";
import { VendorCard } from "./VendorCard";
import { DeliveryBar } from "./DeliveryBar";
import type { LocationChoice } from "@/services/location/server";
import type { Cuisine, Vendor } from "./types";

// The picker is a dialog nobody has opened yet: Radix, the address bar and
// the geocoder stay out of the listing's first load and arrive on the press.
const LocationModal = dynamic(() =>
  import("@/components/shared/LocationModal").then((m) => m.LocationModal),
);

export type ListingCopy = {
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
  clearFilter: string;
  unavailableTitle: string;
  unavailableBody: string;
  noLocationTitle: string;
  noLocationBody: string;
  noLocationAction: string;
};

/**
 * The restaurant listing, connected (Phase 16).
 *
 * Measured from `food Home` at 1553px: the delivery bar, the cuisine row, then
 * "All Restaurant" as a three-column grid on 32px gaps.
 *
 * ## The filter rail is not rendered (D-18)
 *
 * `/vendors/nearby/open` honours a business type, **one** cuisine slug and a
 * name search — measured. Sort, deals, dietary and delivery type are ignored,
 * so the rail's controls would change nothing on screen. The cuisine row is
 * the filter that works; its choice lives in the URL (`?cuisine=`) and the
 * server applies it, so a filtered listing can be shared, reloaded and
 * paginated without a second idea of the result.
 *
 * ## Three nothings
 *
 * No location yet, no matches, not reachable — three sentences with three
 * different fixes.
 */
export function VendorListing({
  locale,
  vendors,
  cuisines,
  copy,
  address,
  countLabel,
  changeHref,
  choices = [],
  addAddressHref,
  locationCopy,
  unavailable = false,
}: {
  locale: Locale;
  vendors: readonly Vendor[];
  cuisines: readonly Cuisine[];
  copy: ListingCopy;
  /** Absent: nobody has said where to deliver. */
  address?: string;
  countLabel?: string;
  /** Where the address is changed when no picker is mounted — the vertical's
   *  front door. */
  changeHref: string;
  /** The saved addresses the customer can switch to; empty for a guest. */
  choices?: readonly LocationChoice[];
  /** The account's addresses screen, for "Add a new address". */
  addAddressHref?: string;
  /** Without it the card's "Change" stays a link to the front door. */
  locationCopy?: LocationModalCopy;
  unavailable?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const selected = params.get("cuisine");
  const [picking, setPicking] = useState(false);

  const choose = (id: string) => {
    const next = new URLSearchParams(params);
    if (selected === id) next.delete("cuisine");
    else next.set("cuisine", id);
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <div className="max-w-shell mx-auto flex w-full flex-col gap-8 px-4 sm:px-8 py-8">
      <DeliveryBar
        address={address}
        countLabel={address ? countLabel : undefined}
        deliveringToLabel={copy.deliveringTo}
        changeLabel={copy.change}
        setAddressLabel={copy.setAddress}
        availabilityLabel={copy.availability}
        changeHref={changeHref}
        onChange={locationCopy ? () => setPicking(true) : undefined}
      />

      {locationCopy ? (
        <LocationModal
          open={picking}
          onOpenChange={setPicking}
          locale={locale}
          choices={choices}
          addHref={addAddressHref}
          unset={!address}
          askOnce
          copy={locationCopy}
        />
      ) : null}

      {address && cuisines.length ? (
        <section className="flex flex-col gap-6">
          <h2 className="text-20 text-ink font-semibold">{copy.favouriteCuisines}</h2>
          <CuisineRow
            cuisines={cuisines}
            selected={selected ? [selected] : []}
            onToggle={choose}
          />
        </section>
      ) : null}

      <section className="flex flex-col gap-6">
        <h2 className="text-20 text-ink font-semibold">{copy.allRestaurants}</h2>

        {!address ? (
          <EmptyState
            icon={<Icon name="location" className="size-8" />}
            title={copy.noLocationTitle}
            description={copy.noLocationBody}
            action={
              <Button asChild>
                <Link href={changeHref}>{copy.noLocationAction}</Link>
              </Button>
            }
          />
        ) : unavailable ? (
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
            action={
              selected ? (
                <Button variant="outline" onClick={() => choose(selected)}>
                  {copy.clearFilter}
                </Button>
              ) : undefined
            }
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
  );
}
