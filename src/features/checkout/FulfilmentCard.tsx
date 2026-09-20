import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export type FulfilmentCopy = {
  title: string;
  delivery: string;
  deliveryBody: string;
  pickup: string;
  pickupBody: string;
  pickupUnavailable: string;
  pickupFrom: string;
  pickupTime: string;
  pickupChange: string;
};

/**
 * Delivery or self-pickup — the old app's "Self pickup" choice, in the slot the
 * design gives its scheduled-delivery card.
 *
 * Choosing pickup opens the time dialog; a pickup is only real once the API has
 * a summary with its time, so the choice itself never flips on its own. On a
 * pickup the card names the store and the time, with a way to change it. When
 * the store has no slot left today, pickup is offered disabled with the reason.
 */
export function FulfilmentCard({
  fulfilment,
  storeName,
  pickupLabel,
  pickupAvailable,
  busy,
  onDelivery,
  onPickup,
  copy,
}: {
  fulfilment: "delivery" | "pickup";
  storeName: string;
  pickupLabel?: string;
  pickupAvailable: boolean;
  busy?: boolean;
  onDelivery: () => void;
  onPickup: () => void;
  copy: FulfilmentCopy;
}) {
  const option = (
    value: "delivery" | "pickup",
    label: string,
    body: string,
    onChoose: () => void,
    disabled: boolean,
  ) => (
    <label
      className={[
        "rounded-16 flex flex-1 items-center gap-4 border p-4 transition-colors",
        fulfilment === value ? "border-brand bg-brand-tint" : "border-line",
        disabled
          ? "cursor-not-allowed opacity-60"
          : "hover:bg-surface-muted cursor-pointer",
      ].join(" ")}
    >
      <span
        aria-hidden
        className="bg-brand-tint text-brand rounded-8 flex size-10 shrink-0 items-center justify-center"
      >
        <Icon name={value === "delivery" ? "ride" : "shop"} className="size-6" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-16 text-ink font-medium">{label}</span>
        <span className="text-14 text-ink-muted">{body}</span>
      </span>
      <input
        type="radio"
        name="checkout-fulfilment"
        className="accent-brand size-5 shrink-0"
        checked={fulfilment === value}
        disabled={disabled}
        onChange={onChoose}
      />
    </label>
  );

  return (
    <section className="border-line rounded-24 bg-surface flex flex-col gap-4 border px-6 py-8">
      <h2 className="text-20 text-ink font-semibold">{copy.title}</h2>
      <div
        role="radiogroup"
        aria-label={copy.title}
        className="flex flex-col gap-4 sm:flex-row"
      >
        {option(
          "delivery",
          copy.delivery,
          copy.deliveryBody,
          onDelivery,
          Boolean(busy),
        )}
        {option(
          "pickup",
          copy.pickup,
          pickupAvailable ? copy.pickupBody : copy.pickupUnavailable,
          onPickup,
          Boolean(busy) || (!pickupAvailable && fulfilment !== "pickup"),
        )}
      </div>

      {fulfilment === "pickup" ? (
        <div className="bg-surface-muted rounded-16 flex flex-wrap items-center justify-between gap-4 p-4">
          <div className="flex flex-col gap-1">
            <p className="text-14 text-ink-muted">{`${copy.pickupFrom} ${storeName}`}</p>
            <p className="text-16 text-ink-strong font-semibold">
              {`${copy.pickupTime}: ${pickupLabel ?? ""}`}
            </p>
          </div>
          {pickupAvailable ? (
            <Button
              variant="link"
              className="text-16 font-medium"
              disabled={busy}
              onClick={onPickup}
            >
              {copy.pickupChange}
            </Button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
