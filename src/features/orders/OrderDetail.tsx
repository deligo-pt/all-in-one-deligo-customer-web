"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { OrderSummary, type SummaryCopy } from "@/features/cart";
import { ImageSlot } from "@/components/shared/ImageSlot";
import { OrderTracker, type TrackerCopy } from "./OrderTracker";
import { notWiredOrders } from "./transport";
import type { ReviewCopy } from "./ReviewModal";
import { ORDER_STEPS, type Order } from "./types";

/** The review is a dialog carrying two star groups and a textarea, and most
 *  visits to an order never open it. Same measurement as every dialog since
 *  Phase 5. */
const ReviewModal = dynamic(() => import("./ReviewModal").then((m) => m.ReviewModal), {
  ssr: false,
});

export type OrderDetailCopy = {
  tracker: TrackerCopy;
  summary: SummaryCopy;
  review: ReviewCopy;
  riderTitle: string;
  deliveryCode: string;
  deliveryCodeBody: string;
  cancel: string;
  reorder: string;
  invoice: string;
  writeReview: string;
  riderImage: string;
  notWired: string;
};

/**
 * `/account/orders/[orderId]` — one order, and what can still be done to it.
 *
 * Adapted from the 412px mobile frames; the desktop file has no order detail
 * (D-15). The tracker, the rider block, the delivery code and the action row
 * are the design's; the two-column arrangement is ours, and it reuses the same
 * 415px summary panel the cart and the checkout draw.
 *
 * **The delivery code is shown, never generated.** It is what proves the
 * courier is handing the order to the right person, and a frontend that made
 * one up would be inventing an authentication token.
 */
export function OrderDetail({
  order,
  homeHref,
  copy,
}: {
  order: Order;
  homeHref: string;
  copy: OrderDetailCopy;
}) {
  const router = useRouter();
  const [notice, setNotice] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [busy, setBusy] = useState(false);

  async function run(call: () => Promise<unknown>) {
    setBusy(true);
    setNotice(null);
    try {
      await call();
      router.refresh();
    } catch {
      setNotice(copy.notWired);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-shell mx-auto flex w-full flex-col gap-8 px-8 py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-32 text-ink font-semibold">{order.vendorName}</h1>
          <p className="text-14 text-ink-muted font-medium">
            {`${order.reference} · ${order.placedOn} · ${order.statusLabel}`}
          </p>
        </div>
        {order.eta ? (
          <p className="bg-brand-tint text-brand text-20 rounded-full px-6 py-3 font-semibold">
            {order.eta}
          </p>
        ) : null}
      </header>

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-8">
          {order.step ? (
            <section className="border-line rounded-24 bg-surface border p-6">
              <OrderTracker
                steps={ORDER_STEPS[order.vertical ?? "food"]}
                step={order.step}
                copy={copy.tracker}
              />
            </section>
          ) : null}

          {order.rider ? (
            <section className="border-line rounded-24 bg-surface flex flex-col gap-4 border p-6">
              <h2 className="text-16 text-ink-strong font-semibold">
                {copy.riderTitle}
              </h2>
              <div className="flex items-center gap-4">
                <ImageSlot
                  src={order.rider.photo}
                  alt={copy.riderImage}
                  sizes="56px"
                  className="size-14 shrink-0 rounded-full"
                />
                <div className="flex min-w-0 flex-col gap-1">
                  <p className="text-20 text-ink-strong font-semibold">
                    {order.rider.name}
                  </p>
                  {/* "4.9 • 2,134 Trips" — verbatim. */}
                  {order.rider.stats ? (
                    <p className="text-16 text-ink-muted font-medium">
                      {order.rider.stats}
                    </p>
                  ) : null}
                  {order.rider.vehicle || order.rider.plate ? (
                    <p className="text-12 text-ink font-medium tracking-wide">
                      {[order.rider.vehicle, order.rider.plate]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  ) : null}
                </div>
              </div>
            </section>
          ) : null}

          {order.deliveryCode ? (
            <section className="border-brand-soft bg-brand-tint rounded-24 flex flex-col gap-2 border p-6">
              <h2 className="text-16 text-brand-deep font-semibold">
                {copy.deliveryCode}
              </h2>
              <p className="text-32 text-brand-strong font-semibold tracking-wider">
                {order.deliveryCode}
              </p>
              <p className="text-14 text-ink-warm">{copy.deliveryCodeBody}</p>
            </section>
          ) : null}

          <div className="flex flex-wrap gap-4">
            {order.canCancel ? (
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => run(() => notWiredOrders.cancel(order.id))}
              >
                {copy.cancel}
              </Button>
            ) : null}
            {order.canReorder ? (
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => run(() => notWiredOrders.reorder(order.id))}
              >
                {copy.reorder}
              </Button>
            ) : null}
            {order.canReview ? (
              <Button variant="outline" onClick={() => setReviewing(true)}>
                {copy.writeReview}
              </Button>
            ) : null}
            {/* A link, not a fetch: the invoice is a file the server already
                has, and `download` lets the browser do what it is for. */}
            {order.invoiceUrl ? (
              <Button asChild variant="outline">
                <a href={order.invoiceUrl} download>
                  <Icon name="tag" className="size-4" />
                  {copy.invoice}
                </a>
              </Button>
            ) : null}
          </div>

          <p role="status" className="text-14 text-ink-muted">
            {notice}
          </p>
        </div>

        {order.store ? (
          <div className="lg:w-104 lg:shrink-0">
            <div className="sticky top-[8rem]">
              <OrderSummary
                store={order.store}
                copy={copy.summary}
                browseHref={homeHref}
                onApplyVoucher={() => setNotice(copy.notWired)}
                onPlaceOrder={() => setNotice(copy.notWired)}
              />
            </div>
          </div>
        ) : null}
      </div>

      {reviewing ? (
        <ReviewModal
          open
          onOpenChange={setReviewing}
          order={order}
          copy={copy.review}
          onSubmit={(rating, review, riderRating) =>
            run(() =>
              notWiredOrders.review({
                orderId: order.id,
                rating,
                review: review || undefined,
                riderRating: riderRating || undefined,
              }),
            )
          }
        />
      ) : null}
    </div>
  );
}
