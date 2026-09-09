"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import type { PlacedOrder } from "./types";

export type ConfirmedCopy = {
  title: string;
  body: string;
  close: string;
  reference: string;
  delivery: string;
  payment: string;
  total: string;
  stayUpdated: string;
  stayUpdatedBody: string;
  backHome: string;
};

/**
 * `Order Confirmed!` — 560×730 at 24px radius.
 *
 * Measured: a 150px illustration, the heading at 32/600 in `ink-strong` over
 * 16/400 in `ink-warm`, a `brand-pale` pill carrying when it arrives, then a
 * `surface-muted` block at 16px radius listing reference, address, payment and
 * total — the total at 20/600 — then a `brand-strong` panel about
 * notifications, and `Back to Home` at 14/600.
 *
 * The design puts a Lottie tick at the top. There is no licensed asset for it,
 * so the slot is the check glyph in a tinted disc: obviously ours, obviously
 * not the final artwork, and not pretending otherwise — the same treatment the
 * cart's empty state got in Phase 7.
 *
 * **Every value on this screen is the order's.** The reference, the window,
 * the address, the payment label and the total all come back from
 * `placeOrder`. Nothing is composed here from what the customer chose, because
 * what they chose is a request and this screen reports what happened.
 */
export function ConfirmedModal({
  open,
  onOpenChange,
  order,
  homeHref,
  copy,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: PlacedOrder;
  homeHref: string;
  copy: ConfirmedCopy;
}) {
  const row = (label: string, value: string) => (
    <div className="border-line-warm flex items-start justify-between gap-4 border-b pb-4 last:border-b-0 last:pb-0">
      <dt className="text-14 text-ink-warm font-semibold">{label}</dt>
      <dd className="text-14 text-ink-strong text-end">{value}</dd>
    </div>
  );

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={copy.title}
      description={copy.body}
      closeLabel={copy.close}
      className="w-[min(35rem,calc(100vw-2rem))]"
    >
      <div className="flex flex-col items-center gap-4">
        <span
          aria-hidden
          className="bg-brand-tint text-brand flex size-24 items-center justify-center rounded-full"
        >
          <Icon name="check-circle" className="size-12" />
        </span>
        {order.when ? (
          <p className="bg-brand-pale text-ink-warm text-14 rounded-full px-6 py-3 font-semibold">
            {order.when}
          </p>
        ) : null}
      </div>

      <dl className="bg-surface-muted rounded-16 flex flex-col gap-4 p-5">
        {row(copy.reference, order.reference)}
        {order.addressLine ? row(copy.delivery, order.addressLine) : null}
        {order.paymentLabel
          ? row(
              copy.payment,
              order.paymentState
                ? `${order.paymentLabel} · ${order.paymentState}`
                : order.paymentLabel,
            )
          : null}
        <div className="flex items-start justify-between gap-4">
          <dt className="text-16 text-ink-strong font-semibold">{copy.total}</dt>
          {/* Verbatim, and it is the amount that was charged. */}
          <dd className="text-20 text-ink-strong font-semibold">{order.total}</dd>
        </div>
      </dl>

      <div className="bg-brand-strong text-ink-inverse rounded-12 flex gap-3 p-4">
        <Icon name="notification" className="mt-0.5 size-4 shrink-0" />
        <div className="flex flex-col gap-1">
          <p className="text-12 font-semibold">{copy.stayUpdated}</p>
          <p className="text-14">{copy.stayUpdatedBody}</p>
        </div>
      </div>

      <Link
        href={homeHref}
        className="text-14 text-brand-strong self-center font-semibold underline-offset-4 hover:underline"
      >
        {copy.backHome}
      </Link>
    </Modal>
  );
}
