import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { CartCharge, CartStore, ChargeKind } from "./types";

export type SummaryCopy = {
  deliveryIn: string;
  addMoreItems: string;
  applyVoucher: string;
  orderSummary: string;
  charge: Record<ChargeKind, string>;
  grandTotal: string;
  placeOrder: string;
};

/**
 * The panel beside the store groups — 415 wide, which is the same panel the
 * vendor page draws empty at 416.
 *
 * That is not a coincidence in the file and it is not one here either: the
 * design reuses the vendor page's cart panel on the cart screen, populated.
 * Phase 7 could only build its empty state, because a populated one needs
 * prices. Phase 17 replaces `features/food`'s `CartPanel` with this.
 *
 * Measured: 16px radius over a `line` border, 24/28 inside; a store header at
 * 16/500 over its delivery estimate at 16/400 above a rule; the lines with a
 * `brand-tint` quantity chip at 4px radius; `Add more items` and
 * `Apply a voucher` as their own rows; then the summary card at 24px radius
 * with the discount row in brand and the grand total at 20/600.
 *
 * ## It summarises one store, because one store is one order
 *
 * D-4's default is that the backend cannot place a single order across two
 * vendors. The design agrees without saying so: this panel carries a store's
 * name, a delivery estimate and a single order reference while three store
 * groups sit beside it. `Place Order` places *this* store's order.
 *
 * ## Nothing here computes
 *
 * Every amount is printed as the backend sent it, and the grand total is a
 * field rather than a sum of the rows above it. A screen that re-derives a
 * total is a screen that can quietly disagree with the one that takes payment.
 */
export function OrderSummary({
  store,
  copy,
  browseHref,
  onApplyVoucher,
  onPlaceOrder,
  busy,
}: {
  store: CartStore;
  copy: SummaryCopy;
  /** The store's own page — "Add more items" is a navigation, so it is a link. */
  browseHref: string;
  onApplyVoucher: () => void;
  onPlaceOrder: () => void;
  busy?: boolean;
}) {
  const label = (charge: CartCharge) =>
    charge.code
      ? `${copy.charge[charge.kind]} (${charge.code})`
      : copy.charge[charge.kind];

  return (
    <section
      aria-label={copy.orderSummary}
      className="border-line rounded-16 bg-surface flex flex-col gap-6 border p-6"
    >
      <div className="border-line flex flex-col gap-2 border-b pb-6">
        <p className="text-16 text-ink font-medium">{store.name}</p>
        {store.deliveryEstimate ? (
          <p className="text-16 text-ink-muted">
            {`${copy.deliveryIn} ${store.deliveryEstimate}`}
          </p>
        ) : null}
      </div>

      <ul className="flex flex-col gap-4">
        {store.lines.map((line) => (
          <li key={line.id} className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-2">
              <span
                aria-hidden
                className="bg-brand-tint text-brand text-16 rounded-4 px-2.5 py-2.5 font-medium"
              >
                {`${line.quantity}×`}
              </span>
              <span className="flex min-w-0 flex-col gap-1">
                <span className="text-16 text-ink font-medium">{line.name}</span>
                {line.description ? (
                  <span className="text-14 text-ink-muted line-clamp-1">
                    {line.description}
                  </span>
                ) : null}
              </span>
            </div>
            <span className="text-16 text-brand shrink-0 font-medium">
              {line.price}
            </span>
          </li>
        ))}
      </ul>

      <Link
        href={browseHref}
        className="text-16 text-brand hover:text-brand-strong inline-flex items-center gap-2 self-start py-2.5 font-normal transition-colors"
      >
        <Icon name="plus" className="size-4" />
        {copy.addMoreItems}
      </Link>

      <div className="border-line border-t pt-6">
        <button
          type="button"
          onClick={onApplyVoucher}
          disabled={busy}
          className="text-16 text-ink-strong flex w-full items-center justify-between gap-4 disabled:opacity-50"
        >
          <span className="inline-flex items-center gap-2">
            <Icon name="tag" className="text-brand size-4" />
            {copy.applyVoucher}
          </span>
          <Icon name="chevron-right" className="text-brand size-6" />
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-16 text-ink-strong font-semibold">{copy.orderSummary}</h3>
          {store.orderRef ? (
            <p className="text-16 text-ink-muted">{store.orderRef}</p>
          ) : null}
        </div>

        <dl className="border-line rounded-24 flex flex-col gap-4 border p-6">
          {(store.totals?.charges ?? []).map((charge) => {
            const discount = charge.kind === "discount";
            const strong = discount || charge.kind === "subtotal";
            return (
              <div key={charge.kind} className="flex items-start justify-between gap-4">
                <dt
                  className={[
                    "text-16",
                    discount ? "text-brand" : "text-ink-muted",
                    strong ? "font-semibold" : "font-normal",
                  ].join(" ")}
                >
                  {label(charge)}
                  {charge.note ? (
                    <span className="text-12 text-ink-muted block font-normal">
                      {charge.note}
                    </span>
                  ) : null}
                </dt>
                <dd
                  className={[
                    "text-16 shrink-0",
                    discount ? "text-brand" : "text-ink-muted",
                    strong ? "font-semibold" : "font-normal",
                  ].join(" ")}
                >
                  {charge.amount}
                </dd>
              </div>
            );
          })}

          <div aria-hidden className="border-line my-1 border-t" />

          <div className="flex items-start justify-between gap-4">
            <dt className="text-16 text-ink-strong">{copy.grandTotal}</dt>
            <dd className="text-20 text-brand shrink-0 font-semibold">
              {store.totals?.total}
            </dd>
          </div>
        </dl>
      </div>

      <Button
        block
        className="rounded-8 h-13 text-16 font-medium"
        disabled={busy}
        onClick={onPlaceOrder}
      >
        {copy.placeOrder}
      </Button>
    </section>
  );
}
