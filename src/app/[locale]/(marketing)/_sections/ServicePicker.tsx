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
    <div className="bg-surface rounded-24 flex w-full flex-col gap-6 p-4 shadow-lg sm:gap-8 sm:p-10">
      {/* On a phone, a one-line slider: swipe, snap to a tab, no scrollbar and
          no divider (the grey bar under the tabs is what was reported as a
          "horizontal bar", 22 Sep 2026), and a fade at the end edge to say
          there is more. It runs to the card's edges (`-mx-4 px-4`) so a tab
          slides out from under the padding rather than being cut at it.
          From `sm` the tabs sit on one or two lines with the design's
          divider, as before. In production only Food and Groceries are
          listed (D-6), which is a single row either way. */}
      <div
        role="radiogroup"
        aria-label={locationLabel}
        className="border-line -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-6 overflow-x-auto px-4 [scrollbar-width:none] max-sm:[mask-image:linear-gradient(to_right,black_85%,transparent)] sm:mx-0 sm:flex-wrap sm:gap-x-10 sm:gap-y-3 sm:overflow-visible sm:border-b sm:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {services.map((service) => {
          const isActive = service.route === selected;
          return (
            <button
              key={service.route}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={(event) => {
                setSelected(service.route);
                // In the slider, bring the chosen tab fully into view.
                // `block: "nearest"` keeps the page itself from moving.
                event.currentTarget.scrollIntoView({
                  behavior: "smooth",
                  block: "nearest",
                  inline: "nearest",
                });
              }}
              className={cn(
                "flex shrink-0 snap-start flex-col items-center gap-2 pb-3 transition-colors sm:pb-4",
                isActive ? "text-brand" : "text-ink hover:text-brand",
              )}
            >
              <Icon name={service.icon} className="size-6" />
              <span className="text-14 font-medium sm:text-16">{service.label}</span>
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
