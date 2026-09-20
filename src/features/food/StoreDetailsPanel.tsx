"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { msUntilClosing } from "@/lib/pickup";
import dynamic from "next/dynamic";
import type { StoreDetails } from "./types";

export type StoreDetailsCopy = {
  /** "Store details" — the button under the name. */
  trigger: string;
  /** "Please contact the vendor" — the dialog's own subtitle; its title is the
   *  store's name, as the old app's was. */
  subtitle: string;
  close: string;
  open: string;
  closed: string;
  hours: string;
  closingDays: string;
  preparation: string;
  address: string;
  phone: string;
  email: string;
  nif: string;
  contactTitle: string;
  otherTitle: string;
  legalName: string;
  euCompliance: string;
  mapUnavailable: string;
  /** "Closing soon" for the countdown chip. */
  closingSoon: string;
  /** "Order within" — a label, and the clock is the next element.
   *
   *  It is deliberately not "Order within {time}". A message with a slot has
   *  to be resolved by the server translator (`verify:i18n` enforces it), and
   *  the value here changes every second on the reader's own machine; a
   *  function prop cannot cross into a client component either. A label and a
   *  figure beside it reads the same in both languages and needs neither. */
  orderWithin: string;
};

// Radix's dialog is 15 KB nobody has asked for until they press the button.
const StoreDetailsModal = dynamic(() =>
  import("./StoreDetailsModal").then((m) => m.StoreDetailsModal),
);

/** The final hour is the window worth counting down; before that, "Open until
 *  22:30" already says everything (the old app used the same hour). */
const WINDOW_MS = 60 * 60 * 1000;

const pad = (value: number) => String(value).padStart(2, "0");

/**
 * The store's hours, days off, preparation time and contacts — the old app's
 * `VendorDetailsModal` and `ClosingCountdown`, together because they answer
 * the same question: can I still order from here, and who are they?
 *
 * **The countdown starts as nothing.** The server cannot render it: the
 * remaining time is a function of the reader's clock at the moment they look,
 * and rendering a figure on the server means shipping a number that was
 * already stale when it arrived. So the first paint has no countdown, the
 * effect computes one, and the store's own wall clock (Europe/Lisbon) decides
 * — a customer in London sees the minutes the kitchen sees.
 */
export function StoreDetailsPanel({
  details,
  closing,
  open,
  name,
  locale,
  copy,
}: {
  details?: StoreDetails;
  closing?: { closingHours?: string; closingDays: readonly string[] };
  /** Whether the store is open now, as the API reports it. */
  open: boolean;
  /** The store's name — the dialog's title, and the map pin's. */
  name: string;
  locale: string;
  copy: StoreDetailsCopy;
}) {
  const [showing, setShowing] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!closing?.closingHours || !open) return;
    const tick = () => {
      const ms = msUntilClosing(
        { closingHours: closing.closingHours, closingDays: closing.closingDays },
        open,
      );
      setRemaining(ms !== null && ms <= WINDOW_MS ? ms : null);
    };
    tick();
    // Recomputed from the clock each second rather than decremented, so a tab
    // that was backgrounded and throttled corrects itself instead of drifting.
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [closing?.closingHours, closing?.closingDays, open]);

  return (
    <div className="flex flex-wrap items-center gap-4">
      {remaining !== null ? (
        <p
          role="status"
          aria-live="polite"
          className="border-brand-soft bg-brand-tint text-brand rounded-12 text-14 flex items-center gap-2 border px-3 py-2 font-medium"
        >
          <Icon name="clock" className="size-4" />
          <span className="font-semibold uppercase">{copy.closingSoon}</span>
          <span>
            {copy.orderWithin}{" "}
            <time className="tabular-nums">
              {pad(Math.floor(remaining / 60000))}:
              {pad(Math.floor((remaining % 60000) / 1000))}
            </time>
          </span>
        </p>
      ) : null}

      {details ? (
        <>
          <button
            type="button"
            onClick={() => setShowing(true)}
            className="text-16 text-brand font-medium underline-offset-4 hover:underline"
          >
            {copy.trigger}
          </button>

          {showing ? (
            <StoreDetailsModal
              open={showing}
              onOpenChange={setShowing}
              storeOpen={open}
              details={details}
              name={name}
              locale={locale}
              copy={copy}
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}
