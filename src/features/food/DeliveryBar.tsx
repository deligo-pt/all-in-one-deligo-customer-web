import { Icon } from "@/components/ui/Icon";

/**
 * "Delivering to Avenida da Liberdade, Lisbon — Change · 120+ restaurants
 * available at your location."
 *
 * Measured: full width, 80 tall, 16px radius, `surface-subtle` on a
 * `brand-soft` border; the address block at one end and the count at 32/600 at
 * the other, split by a vertical rule.
 *
 * **The count is a string, and the address is optional.** Neither is known
 * until Phase 16 reads the profile and asks `/vendors/nearby/open`. Without an
 * address this renders the prompt to set one, which is the state a first-time
 * visitor is actually in and the one the design does not draw.
 */
export function DeliveryBar({
  address,
  countLabel,
  deliveringToLabel,
  changeLabel,
  setAddressLabel,
  availabilityLabel,
  onChange,
}: {
  address?: string;
  /** "120+" — exactly as the API phrases it. */
  countLabel?: string;
  deliveringToLabel: string;
  changeLabel: string;
  setAddressLabel: string;
  availabilityLabel: string;
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

      {/* Phase 16 opens the address picker. A button that says what it will do
          and does not do it yet is still the right control to put here — the
          alternative is a link to nowhere. */}
      <button
        type="button"
        onClick={onChange}
        className="text-16 text-brand font-medium underline-offset-4 hover:underline"
      >
        {changeLabel}
      </button>

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
