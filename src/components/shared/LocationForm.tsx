"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";

export type LocationFormCopy = {
  addressLabel: string;
  addressPlaceholder: string;
  locateMe: string;
  notFound: string;
  denied: string;
  unavailable: string;
  position: string;
  currentLocation: string;
};

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
 */
export function LocationForm({
  locale,
  href,
  onSaved,
  copy,
}: {
  locale: string;
  /** The listing to open once a location is set. Omitted in the dialog, which
   *  is already on one. */
  href?: string;
  /** Called after the location is stored, instead of navigating. */
  onSaved?: () => void;
  copy: LocationFormCopy;
}) {
  const router = useRouter();
  const [address, setAddress] = useState("");
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
    if (!query) return;
    setPending("address");
    setProblem(null);
    try {
      const { geocodeAddress } = await import("@/services/maps/browser");
      const found = await geocodeAddress(query, locale);
      if (!found) setProblem("notFound");
      else await save(found);
    } catch (error) {
      console.error("[location] address lookup failed", error);
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
    <div className="flex w-full max-w-xl flex-col gap-2">
      <form
        className="border-line bg-surface rounded-16 flex w-full items-center gap-3 border p-3"
        onSubmit={(event) => {
          event.preventDefault();
          void submitAddress();
        }}
      >
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
        <button
          type="button"
          onClick={locate}
          disabled={pending !== null}
          className="text-14 text-brand inline-flex shrink-0 items-center gap-2 pe-3 font-medium disabled:opacity-60"
        >
          {pending === "locate" ? (
            <Spinner className="size-4" />
          ) : (
            <Icon name="my-location" className="size-4" />
          )}
          {copy.locateMe}
        </button>
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
