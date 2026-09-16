import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

/**
 * "Delivering to Avenida da Liberdade, Lisbon — Change · 120+ restaurants
 * available at your location."
 *
 * Measured: full width, 80 tall, 16px radius, `surface-subtle` on a
 * `brand-soft` border; the address block at one end and the count at 32/600 at
 * the other, split by a vertical rule.
 *
 * **The count is a string, and the address is optional.** The address is the
 * profile's active one or the guest's chosen location (Phase 16). Without one
 * this renders the prompt to set one, which is the state a first-time visitor
 * is actually in and the one the design does not draw.
 *
 * **"Change" opens the picker where there is one** (Phase 20b) — the saved
 * addresses and the address bar, on the card the customer is already reading.
 * Without `onChange` it falls back to the vertical's front door, so the bar
 * still works in a server-rendered context that mounts no dialog.
 */
export function DeliveryBar({
  address,
  countLabel,
  deliveringToLabel,
  changeLabel,
  setAddressLabel,
  availabilityLabel,
  changeHref,
  onChange,
}: {
  address?: string;
  /** "120+" — exactly as the API phrases it. */
  countLabel?: string;
  deliveringToLabel: string;
  changeLabel: string;
  setAddressLabel: string;
  availabilityLabel: string;
  changeHref: string;
  /** Opens the location picker instead of navigating. */
  onChange?: () => void;
}) {
  return (
    <div className="border-brand-soft bg-surface-subtle rounded-16 flex flex-wrap items-center gap-6 border px-6 py-4">
      <span className="bg-brand-tint text-brand flex size-11 shrink-0 items-center justify-center rounded-full">
        <Icon name="location" className="size-5" />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-14 text-brand font-medium">{deliveringToLabel}</span>
        <span className="text-16 text-ink truncate">{address ?? setAddressLabel}</span>
      </div>

      {onChange ? (
        <button
          type="button"
          onClick={onChange}
          className="text-16 text-brand font-medium underline-offset-4 hover:underline"
        >
          {changeLabel}
        </button>
      ) : (
        <Link
          href={changeHref}
          className="text-16 text-brand font-medium underline-offset-4 hover:underline"
        >
          {changeLabel}
        </Link>
      )}

      {countLabel ? (
        <>
          <span aria-hidden className="bg-line hidden h-12 w-px lg:block" />
          <p className="text-16 text-ink-muted">
            <span className="text-32 text-ink font-semibold">{countLabel}</span>{" "}
            {availabilityLabel}
          </p>
        </>
      ) : null}
    </div>
  );
}
