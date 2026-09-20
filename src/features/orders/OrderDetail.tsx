"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { ImageSlot } from "@/components/shared/ImageSlot";
import { OrderSummary, type SummaryCopy } from "@/features/cart";
import { downloadInvoice } from "@/services/orders/browser";
import { ordersApi } from "./api";
import type { CancelCopy } from "./CancelModal";
import { OrderTracker, type TrackerCopy } from "./OrderTracker";
import type { OrderMapCopy } from "./OrderMap";

// Google Maps is ~90 KB and only a delivery in flight has anywhere to put it.
const OrderMap = dynamic(() => import("./OrderMap").then((m) => m.OrderMap));
import type { ReviewCopy } from "./ReviewModal";
import { ORDER_STEPS, type Order, type RefundState } from "./types";

/** Two dialogs, neither in the first paint. */
const ReviewModal = dynamic(() => import("./ReviewModal").then((m) => m.ReviewModal), {
  ssr: false,
});
const CancelModal = dynamic(() => import("./CancelModal").then((m) => m.CancelModal), {
  ssr: false,
});

/** How often a live order re-reads itself. The old app polled live orders at
 *  30 s; push messages refresh sooner when they arrive. */
const LIVE_REFRESH_MS = 30_000;

export type OrderDetailCopy = {
  backToOrders: string;
  reportIssue: string;
  tracker: TrackerCopy;
  summary: SummaryCopy;
  review: ReviewCopy;
  cancelDialog: CancelCopy;
  map: OrderMapCopy;
  riderTitle: string;
  riderImage: string;
  deliveryCode: string;
  deliveryCodeBody: string;
  pickupCode: string;
  pickupCodeBody: string;
  endedTitle: string;
  refund: Record<RefundState, string>;
  cancel: string;
  reorder: string;
  invoice: string;
  invoicePending: string;
  writeReview: string;
  actionFailed: string;
};

/**
 * `/account/orders/[orderId]` — one order, and what can still be done to it.
 *
 * Laid out after the desktop `add pizza` tracking frames (D-15, realigned
 * here): the reference and ETA on top, the tracker, the code the customer
 * gives (the rider's delivery code, or the counter's pickup code), the rider,
 * then the actions — beside the same summary panel the cart and checkout draw,
 * without its cart controls.
 *
 * A live order re-reads itself every 30 seconds. Every write re-reads the page
 * afterwards; a refusal shows the API's own sentence. Codes are shown, never
 * generated, and only until they are verified.
 */
export function OrderDetail({
  order,
  cartHref,
  supportHref,
  ordersHref,
  locale,
  copy,
  offlineNotice,
}: {
  order: Order;
  cartHref: string;
  /** The map's language — Google labels its own tiles. */
  locale: string;
  /** Support, for "Report an issue"; the order is added here. */
  supportHref: string;
  /** The list this order belongs to — the way back. */
  ordersHref: string;
  copy: OrderDetailCopy;
  /** Set on the states page: every write refuses with this sentence. */
  offlineNotice?: string;
}) {
  const router = useRouter();
  const [notice, setNotice] = useState<string | null>(null);
  const [dialog, setDialog] = useState<"review" | "cancel" | null>(null);
  const [busy, setBusy] = useState(false);
  const live = order.bucket === "ongoing";

  useEffect(() => {
    if (!live || offlineNotice) return;
    const timer = setInterval(() => router.refresh(), LIVE_REFRESH_MS);
    return () => clearInterval(timer);
  }, [live, offlineNotice, router]);

  async function run(call: () => Promise<void>, after?: () => void) {
    if (offlineNotice) return setNotice(offlineNotice);
    setBusy(true);
    setNotice(null);
    try {
      await call();
      setDialog(null);
      after?.();
    } catch (error) {
      setNotice(
        error instanceof Error && error.message ? error.message : copy.actionFailed,
      );
    } finally {
      router.refresh();
      setBusy(false);
    }
  }

  const code = order.deliveryCode
    ? {
        title: copy.deliveryCode,
        body: copy.deliveryCodeBody,
        value: order.deliveryCode,
      }
    : order.pickupCode
      ? { title: copy.pickupCode, body: copy.pickupCodeBody, value: order.pickupCode }
      : null;

  return (
    <div className="max-w-shell mx-auto flex w-full flex-col gap-8 px-8 py-8">
      <Link
        href={ordersHref}
        className="text-14 text-brand hover:text-brand-strong inline-flex items-center gap-2 self-start font-medium"
      >
        <Icon name="arrow-left" className="size-4" />
        {copy.backToOrders}
      </Link>
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
          {order.bucket === "cancelled" ? (
            <section className="border-line rounded-24 bg-surface flex flex-col gap-2 border p-6">
              <h2 className="text-20 text-ink-strong font-semibold">
                {order.statusLabel}
              </h2>
              {order.endedReason ? (
                <p className="text-16 text-ink-warm">
                  {`${copy.endedTitle} ${order.endedReason}`}
                </p>
              ) : null}
              {order.refund ? (
                <p className="text-14 text-ink-muted">{copy.refund[order.refund]}</p>
              ) : null}
            </section>
          ) : null}

          {/* The map sits above the tracker, as the design's `live track`
              frame does: where the food is, then how far along it is. */}
          {order.route ? (
            <OrderMap route={order.route} locale={locale} copy={copy.map} />
          ) : null}

          {order.step ? (
            <section className="border-line rounded-24 bg-surface border p-6">
              <OrderTracker
                steps={ORDER_STEPS[order.fulfilment]}
                step={order.step}
                copy={copy.tracker}
              />
            </section>
          ) : null}

          {code ? (
            <section className="border-brand-soft bg-brand-tint rounded-24 flex flex-col gap-2 border p-6">
              <h2 className="text-16 text-brand-deep font-semibold">{code.title}</h2>
              <p className="text-32 text-brand-strong font-semibold tracking-wider">
                {code.value}
              </p>
              <p className="text-14 text-ink-warm">{code.body}</p>
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
                <p className="text-20 text-ink-strong font-semibold">
                  {order.rider.name}
                </p>
              </div>
            </section>
          ) : null}

          <div className="flex flex-wrap items-center gap-4">
            {order.canCancel ? (
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => {
                  setNotice(null);
                  setDialog("cancel");
                }}
              >
                {copy.cancel}
              </Button>
            ) : null}
            {order.canReorder ? (
              <Button
                variant="outline"
                disabled={busy}
                onClick={() =>
                  run(
                    () => ordersApi.reorder(order.id),
                    () => router.push(cartHref),
                  )
                }
              >
                {copy.reorder}
              </Button>
            ) : null}
            {order.productsToRate.length > 0 || order.rateRider ? (
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => {
                  setNotice(null);
                  setDialog("review");
                }}
              >
                {copy.writeReview}
              </Button>
            ) : null}
            <Button asChild variant="outline">
              <Link
                href={`${supportHref}?order=${encodeURIComponent(order.recordId)}&ref=${encodeURIComponent(order.id)}`}
              >
                {copy.reportIssue}
              </Link>
            </Button>
            {order.bucket === "complete" ? (
              order.invoiceReady ? (
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={async () => {
                    if (offlineNotice) return setNotice(offlineNotice);
                    setBusy(true);
                    setNotice(null);
                    const failure = await downloadInvoice(order.id);
                    if (failure !== null) setNotice(failure || copy.actionFailed);
                    setBusy(false);
                  }}
                >
                  {copy.invoice}
                </Button>
              ) : (
                <p className="text-14 text-ink-muted">{copy.invoicePending}</p>
              )
            ) : null}
          </div>

          <p role="status" className="text-14 text-danger empty:hidden">
            {dialog ? null : notice}
          </p>
        </div>

        {order.store ? (
          <div className="lg:w-104 lg:shrink-0">
            <div className="sticky top-[8rem]">
              <OrderSummary store={order.store} copy={copy.summary} />
            </div>
          </div>
        ) : null}
      </div>

      {dialog === "review" ? (
        <ReviewModal
          open
          onOpenChange={(next) => !next && setDialog(null)}
          order={order}
          busy={busy}
          notice={notice}
          copy={copy.review}
          onSubmit={(rating, review, riderRating) =>
            run(() =>
              ordersApi.review({
                recordId: order.recordId,
                productIds: order.productsToRate,
                rating,
                review: review || undefined,
                riderRating: order.rateRider ? riderRating : undefined,
              }),
            )
          }
        />
      ) : null}

      {dialog === "cancel" ? (
        <CancelModal
          open
          onOpenChange={(next) => !next && setDialog(null)}
          busy={busy}
          notice={notice}
          copy={copy.cancelDialog}
          onConfirm={(reason) => run(() => ordersApi.cancel(order.id, reason))}
        />
      ) : null}
    </div>
  );
}
