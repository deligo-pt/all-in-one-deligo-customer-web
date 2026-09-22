"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { ImageSlot } from "@/components/shared/ImageSlot";
import dynamic from "next/dynamic";
import type { LocationModalCopy } from "@/components/shared/LocationModal";
import { DeliveryBar, VendorCard } from "@/features/food";
import type { Locale } from "@/lib/i18n/locale";
import { withLocale } from "@/lib/i18n/path";
import { ROUTES } from "@/lib/routes";
import type { LocationChoice } from "@/services/location/server";
import type { StoreListing } from "./types";

// The picker is a dialog nobody has opened yet: Radix, the address bar and
// the geocoder stay out of the listing's first load and arrive on the press.
const LocationModal = dynamic(() =>
  import("@/components/shared/LocationModal").then((m) => m.LocationModal),
);

export type GroceryListingCopy = {
  deliveringTo: string;
  change: string;
  setAddress: string;
  availability: string;
  storeImage: string;
  rating: string;
  emptyTitle: string;
  emptyBody: string;
  unavailableTitle: string;
  unavailableBody: string;
  noLocationTitle: string;
  noLocationBody: string;
  noLocationAction: string;
};

/**
 * The store listing — `Gro Home` at 1561px, connected (Phase 16).
 *
 * The food listing's frame: delivery bar, an optional promotion banner, then
 * titled shelves of the food vertical's cards. The rail is not rendered — the
 * API filters stores by nothing but location (D-18). Three nothings, as on
 * food: no location, no stores, not reachable.
 */
export function GroceryListing({
  locale,
  listing,
  copy,
  address,
  changeHref,
  choices = [],
  addAddressHref,
  locationCopy,
  unavailable = false,
}: {
  locale: Locale;
  listing: StoreListing;
  copy: GroceryListingCopy;
  address?: string;
  changeHref: string;
  /** The saved addresses the customer can switch to; empty for a guest. */
  choices?: readonly LocationChoice[];
  /** The account's addresses screen, for "Add a new address". */
  addAddressHref?: string;
  /** Without it the card's "Change" stays a link to the front door. */
  locationCopy?: LocationModalCopy;
  unavailable?: boolean;
}) {
  const [picking, setPicking] = useState(false);
  const { promotion } = listing;
  const shelves = listing.shelves.filter((shelf) => shelf.stores.length > 0);

  return (
    <div className="max-w-shell mx-auto flex w-full flex-col gap-8 px-4 sm:px-8 py-8">
      <DeliveryBar
        address={address}
        countLabel={address ? listing.countLabel : undefined}
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

      {promotion ? (
        <section className="rounded-16 relative isolate flex min-h-88 flex-col justify-center gap-4 overflow-hidden p-8 lg:px-15">
          <ImageSlot
            src={promotion.image}
            alt={promotion.title}
            sizes="977px"
            className="absolute inset-0 -z-10 size-full"
          />
          <h2 className="text-32 text-ink lg:text-40 max-w-lg font-medium whitespace-pre-line">
            {promotion.title}
          </h2>
          {promotion.body ? (
            <p className="text-16 text-ink-muted max-w-xl font-medium">
              {promotion.body}
            </p>
          ) : null}
        </section>
      ) : null}

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
      ) : shelves.length === 0 ? (
        <EmptyState
          icon={<Icon name="search" className="size-8" />}
          title={copy.emptyTitle}
          description={copy.emptyBody}
        />
      ) : (
        shelves.map((shelf) => (
          <section key={shelf.id} className="flex flex-col gap-6">
            <h2 className="text-20 text-ink font-semibold">{shelf.title}</h2>
            <ul className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
              {shelf.stores.map((store) => (
                <li key={store.id}>
                  <VendorCard
                    vendor={store}
                    locale={locale}
                    href={withLocale(
                      ROUTES.groceryStore.path.replace("[storeId]", store.id),
                      locale,
                    )}
                    imageLabel={copy.storeImage}
                    ratingLabel={copy.rating}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
