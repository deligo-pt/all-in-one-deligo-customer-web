"use client";

import { useState } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { LocationForm, type LocationFormCopy } from "@/components/shared/LocationForm";
import type { LocationChoice } from "@/services/location/server";
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
 * **The field is the real one** (Phase 20n). It was a plain input wired to
 * nothing, "Use current location" was a `<span>`, and Explore was a link — so
 * a customer typed their address, pressed Explore, and the vertical's front
 * door asked for it again. It is now the same `LocationForm` the rest of the
 * app uses: the address is geocoded, stored, and the chosen vertical opens
 * with it already set. It starts from the address we already hold.
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
  exploreLabel,
  known,
  saved,
  locationCopy,
}: {
  locale: Locale;
  services: readonly PickerService[];
  locationLabel: string;
  exploreLabel: string;
  /** Where we already deliver, if we know. */
  known?: string;
  /** The customer's saved addresses, offered in the field's picker. */
  saved?: readonly LocationChoice[];
  locationCopy: LocationFormCopy;
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
        <span className="text-12 text-brand font-medium">{locationLabel}</span>
        {/* The chosen tab decides where Explore goes; the form decides that it
            goes there *with* a location. */}
        <LocationForm
          locale={locale}
          href={withLocale(ROUTES[active?.route ?? "food"].path, locale)}
          known={known}
          saved={saved}
          submitLabel={exploreLabel}
          // The card is 798px wide; the field takes what the row leaves, so a
          // long address is read rather than cut off at "Dhaka, Bang…".
          fill
          copy={locationCopy}
        />
      </div>
    </div>
  );
}
