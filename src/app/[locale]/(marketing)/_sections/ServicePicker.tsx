"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n/locale";
import { withLocale } from "@/lib/i18n/path";
import { ROUTES, type RouteName } from "@/lib/routes";

/**
 * The card that sits over the hero: six service tabs, a delivery-location
 * field, and Explore.
 *
 * Measured: 798×330, white, 24px radius, 42px padding; the tab row is 70px
 * with a 1px rule under it and a 2px brand indicator under the active tab; the
 * location field is 43px at 8px radius; Explore is a 37px pill.
 *
 * The tabs are a `radiogroup`, not links and not buttons: they choose which
 * service Explore will open, and only one can be chosen. A row of buttons would
 * announce six independent actions and give no clue that picking one unpicks
 * the others.
 *
 * Nothing here reads the location yet. Phase 16 wires the field to the places
 * API; until then Explore goes to the chosen vertical and the field is a real
 * input rather than a picture of one.
 */
export type PickerService = {
  route: RouteName;
  icon: IconName;
  label: string;
  available: boolean;
};

export function ServicePicker({
  locale,
  services,
  locationLabel,
  locationPlaceholder,
  useCurrentLocationLabel,
  exploreLabel,
}: {
  locale: Locale;
  services: readonly PickerService[];
  locationLabel: string;
  locationPlaceholder: string;
  useCurrentLocationLabel: string;
  exploreLabel: string;
}) {
  const [selected, setSelected] = useState(services[0]?.route);
  const active = services.find((service) => service.route === selected) ?? services[0];

  return (
    <div className="bg-surface rounded-24 flex w-full flex-col gap-8 p-6 shadow-lg sm:p-10">
      <div
        role="radiogroup"
        aria-label={locationLabel}
        className="border-line flex gap-6 overflow-x-auto border-b sm:gap-10"
      >
        {services.map((service) => {
          const isActive = service.route === selected;
          return (
            <button
              key={service.route}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => setSelected(service.route)}
              className={cn(
                "flex shrink-0 flex-col items-center gap-2 pb-4 transition-colors",
                isActive ? "text-brand" : "text-ink hover:text-brand",
              )}
            >
              <Icon name={service.icon} className="size-6" />
              <span className="text-16 font-medium">{service.label}</span>
              <span
                aria-hidden
                className={cn(
                  "rounded-32 h-0.5 w-full",
                  isActive ? "bg-brand" : "bg-transparent",
                )}
              />
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="hero-location" className="text-12 text-brand font-medium">
          {locationLabel}
        </label>
        <Input
          id="hero-location"
          name="location"
          placeholder={locationPlaceholder}
          startIcon={<Icon name="location" className="size-4" />}
          className="text-14 rounded-8 h-11"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Geolocation is Phase 16's — the browser prompt without somewhere to
            send the coordinates is a permission request for nothing. */}
        <span className="text-14 text-brand inline-flex items-center gap-2 font-medium">
          <Icon name="my-location" className="size-4" />
          {useCurrentLocationLabel}
        </span>
        <Button shape="pill" size="sm" asChild>
          <Link href={withLocale(ROUTES[active?.route ?? "food"].path, locale)}>
            {exploreLabel}
          </Link>
        </Button>
      </div>
    </div>
  );
}
