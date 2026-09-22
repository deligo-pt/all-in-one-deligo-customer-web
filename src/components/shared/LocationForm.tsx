"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import type { LocationChoice } from "@/services/location/server";
import { Spinner } from "@/components/ui/Spinner";
import dynamic from "next/dynamic";

export type LocationFormCopy = {
  /** "Saved addresses" — names the picker, and is its empty-state label. */
  savedLabel?: string;
  addressLabel: string;
  addressPlaceholder: string;
  locateMe: string;
  notFound: string;
  denied: string;
  unavailable: string;
  position: string;
  currentLocation: string;
};

// Radix's Select is 8 KB nobody with one address needs; a guest has none at
// all. Loaded when a customer who has saved addresses renders the field.
const SavedAddressPicker = dynamic(() =>
  import("@/components/shared/SavedAddressPicker").then((m) => m.SavedAddressPicker),
);

type Problem = "notFound" | "denied" | "position" | "unavailable";

/**
 * The hero's address bar (Phase 16): type an address and press Enter, or
 * "Locate me". Either becomes coordinates, is stored by `/api/location`, and
 * the listing opens for that place. Maps and the geocoder load on first use,
 * never with the page.
 *
 * It is also the bottom half of the location card's dialog (Phase 20b). There
 * the customer is already on the listing they wanted, so there is nowhere to
 * open: `onSaved` closes the dialog and the page re-renders in place.
 *
 * **It starts from what we already know** (Phase 20n). A customer with an
 * active delivery address — or a guest who chose a place last week — was being
 * shown an empty "Where should we deliver?" on every front door, as if the app
 * had never met them. `known` fills the field, and submitting it unchanged
 * **navigates without geocoding**: the place is already placed, and asking
 * Google to find it again would be a round trip to learn what we were told.
 */
export function LocationForm({
  locale,
  href,
  onSaved,
  known,
  saved = [],
  submitLabel,
  fill = false,
  copy,
}: {
  locale: string;
  /** The listing to open once a location is set. Omitted in the dialog, which
   *  is already on one. */
  href?: string;
  /** Called after the location is stored, instead of navigating. */
  onSaved?: () => void;
  /** Where we already deliver: the profile's active address, or the guest's
   *  chosen place. The field starts here. */
  known?: string;
  /** The customer's own addresses, offered as a picker beside the field.
   *  Empty for a guest, who has none. */
  saved?: readonly LocationChoice[];
  /** Renders a submit button with this label — the landing card's "Explore".
   *  Without it the form is submitted by pressing Enter, as the hero's is. */
  submitLabel?: string;
  /** Fill the width given rather than the hero's 36rem column, so a long
   *  address is read rather than truncated. */
  fill?: boolean;
  copy: LocationFormCopy;
}) {
  const router = useRouter();
  const [address, setAddress] = useState(known ?? "");
  // The place we already hold: what `known` was, or whatever has been settled
  // since — a saved address chosen below, or an address just geocoded. Submit
  // compares against this, so an unchanged field costs no round trip.
  const [settled, setSettled] = useState(known ?? "");
  const [pending, setPending] = useState<"address" | "locate" | null>(null);
  const [problem, setProblem] = useState<Problem | null>(null);

  async function save(location: {
    latitude: number;
    longitude: number;
    label: string;
  }) {
    const { saveGuestLocation } = await import("@/services/location/browser");
    await saveGuestLocation(location);
    onSaved?.();
    if (href) router.push(href);
    router.refresh();
  }

  async function submitAddress() {
    const query = address.trim();
    // Unchanged from what we already hold: go, and spend no geocode on it.
    if (settled && query === settled.trim()) {
      onSaved?.();
      if (href) router.push(href);
      return;
    }
    if (!query) {
      // Nothing typed and nothing known: the field is the only way on.
      if (!settled) return;
      onSaved?.();
      if (href) router.push(href);
      return;
    }
    setPending("address");
    setProblem(null);
    try {
      const { geocodeAddress } = await import("@/services/maps/browser");
      const found = await geocodeAddress(query, locale);
      if (!found) setProblem("notFound");
      else {
        setSettled(found.label || query);
        await save(found);
      }
    } catch (error) {
      console.error("[location] address lookup failed", error);
      setProblem("unavailable");
    } finally {
      setPending(null);
    }
  }

  /** One of the customer's own addresses. Choosing it makes it **active** on
   *  the account — the same account-wide change the listing's picker makes —
   *  and fills the field, so Explore then costs no geocode. */
  async function choose(id: string) {
    const chosen = saved.find((option) => option.id === id);
    if (!chosen) return;
    setAddress(chosen.line);
    setSettled(chosen.line);
    setProblem(null);
    setPending("address");
    try {
      const { activateAddress } = await import("@/services/location/browser");
      await activateAddress(chosen.id);
      router.refresh();
    } catch (error) {
      console.error("[location] switching the active address failed", error);
      setProblem("unavailable");
    } finally {
      setPending(null);
    }
  }

  function locate() {
    if (!("geolocation" in navigator)) return setProblem("unavailable");
    setPending("locate");
    setProblem(null);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const { reverseGeocode } = await import("@/services/maps/browser");
          const label =
            (await reverseGeocode(coords.latitude, coords.longitude, locale)) ??
            copy.currentLocation;
          await save({ latitude: coords.latitude, longitude: coords.longitude, label });
        } catch (error) {
          console.error("[location] saving the location failed", error);
          setProblem("unavailable");
        } finally {
          setPending(null);
        }
      },
      (error) => {
        setPending(null);
        // Denied is the customer's setting. Unavailable and timeout are the
        // device: on macOS, most often location services being off for the
        // browser itself — a different fix, so a different sentence.
        console.warn("[location] geolocation failed", error.code, error.message);
        setProblem(error.code === error.PERMISSION_DENIED ? "denied" : "position");
      },
      { timeout: 10_000, maximumAge: 60_000 },
    );
  }

  return (
    // `@container`: the form answers to the width of *its card*, not the
    // screen. It lives in three cards — the landing hero, the listing's
    // delivery card and the location dialog — and one row of saved addresses,
    // field, "use current location" and Explore needs about 670px (42rem — an
    // arbitrary size, because this theme resets the named container sizes).
    // Measured on phones it overflowed the hero card by 7–101px (owner's
    // screenshot, 22 Sep 2026).
    //
    // Narrower than that it is laid out for a thumb, in this order:
    //   1. the field, with "use current location" as an icon inside its row;
    //   2. saved addresses, on a line of its own (only when there are any);
    //   3. Explore, the full width of the card.
    // `order-*` rearranges the same four controls, so there is one of each and
    // the wide layout is untouched.
    <div
      className={cn(
        "@container flex w-full flex-col gap-2",
        !fill && "max-w-xl",
      )}
    >
      <form
        className="border-line bg-surface rounded-16 flex w-full flex-wrap items-center gap-x-2 gap-y-3 border p-3 @min-[42rem]:flex-nowrap @min-[42rem]:gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          void submitAddress();
        }}
      >
        {saved.length > 0 && copy.savedLabel ? (
          <div className="order-3 basis-full @min-[42rem]:order-none @min-[42rem]:basis-auto">
            <SavedAddressPicker
              saved={saved}
              label={copy.savedLabel}
              disabled={pending !== null}
              onChoose={(id) => void choose(id)}
            />
          </div>
        ) : null}

        {/* First on a narrow card, sharing its row only with the locate icon;
            back between the picker and the actions once the card is wide. */}
        <div className="order-1 min-w-0 flex-1 @min-[42rem]:order-none">
          <Input
            name="address"
            autoComplete="street-address"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            aria-label={copy.addressLabel}
            placeholder={copy.addressPlaceholder}
            startIcon={
              pending === "address" ? (
                <Spinner className="size-5" />
              ) : (
                <Icon name="location" className="size-5" />
              )
            }
            className="border-0 bg-transparent"
            disabled={pending !== null}
          />
        </div>
        {/* An icon beside the field on a narrow card — a 40px target, named by
            its label, which is kept for screen readers — and the full text
            button once there is room for it. */}
        <button
          type="button"
          onClick={locate}
          disabled={pending !== null}
          title={copy.locateMe}
          className="text-14 text-brand hover:bg-brand-tint rounded-8 order-2 inline-flex size-10 shrink-0 items-center justify-center font-medium disabled:opacity-60 @min-[42rem]:order-none @min-[42rem]:size-auto @min-[42rem]:gap-2 @min-[42rem]:pe-3 @min-[42rem]:hover:bg-transparent"
        >
          {pending === "locate" ? (
            <Spinner className="size-5 @min-[42rem]:size-4" />
          ) : (
            <Icon name="my-location" className="size-5 @min-[42rem]:size-4" />
          )}
          <span className="sr-only @min-[42rem]:not-sr-only">{copy.locateMe}</span>
        </button>
        {submitLabel ? (
          <Button
            type="submit"
            shape="pill"
            size="sm"
            disabled={pending !== null}
            className="order-4 shrink-0 basis-full @min-[42rem]:order-none @min-[42rem]:ms-auto @min-[42rem]:basis-auto"
          >
            {submitLabel}
          </Button>
        ) : null}
      </form>
      <p
        role="status"
        aria-live="polite"
        className="text-14 text-brand-strong empty:hidden"
      >
        {problem ? copy[problem] : null}
      </p>
    </div>
  );
}
