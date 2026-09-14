"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import type { PlacedOrder } from "@/features/checkout";
import { abandonPayment, completePayment } from "@/services/checkout/browser";
import type { ConfirmedCopy } from "./ConfirmedModal";

/** The dialog loads only on the page that shows it. */
const ConfirmedModal = dynamic(
  () => import("./ConfirmedModal").then((m) => m.ConfirmedModal),
  { ssr: false },
);

export type OutcomeCopy = {
  finishing: string;
  failedTitle: string;
  failedBody: string;
  missingTitle: string;
  missingBody: string;
  retry: string;
  viewOrders: string;
  backToCart: string;
  paymentFailedTitle: string;
  paymentFailedBody: string;
  confirmed: ConfirmedCopy;
};

/**
 * What the customer sees after REDUNIQ (Phase 18) — one component for the two
 * return routes, so neither ships the other's parts:
 *
 * - `finish`: the order does not exist yet. Our server creates it from the
 *   remembered checkout (`/api/checkout/complete`) and the page comes back
 *   with `?order=`. Safe to reload — a converted checkout answers with its
 *   order instead of ordering again.
 * - `confirmed`: the design's `Order Confirmed!` over `GET /orders/:orderId`.
 * - `failed`: the provider returned without a payment. The checkout is reset
 *   for another attempt and forgotten; nothing was ordered.
 */
export function PaymentOutcome(
  props: {
    ordersHref: string;
    cartHref: string;
    homeHref: string;
    copy: OutcomeCopy;
  } & (
    | { kind: "finish"; checkoutId?: string; successPath: string }
    | { kind: "confirmed"; order: PlacedOrder }
    | { kind: "failed" }
  ),
) {
  if (props.kind === "confirmed")
    return (
      <Confirmed
        order={props.order}
        homeHref={props.homeHref}
        ordersHref={props.ordersHref}
        copy={props.copy.confirmed}
      />
    );
  if (props.kind === "failed")
    return <Failed cartHref={props.cartHref} copy={props.copy} />;
  return (
    <Finish
      checkoutId={props.checkoutId}
      successPath={props.successPath}
      ordersHref={props.ordersHref}
      copy={props.copy}
    />
  );
}

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div className="max-w-shell mx-auto w-full px-8 py-16">{children}</div>
);

function Finish({
  checkoutId,
  successPath,
  ordersHref,
  copy,
}: {
  checkoutId?: string;
  successPath: string;
  ordersHref: string;
  copy: OutcomeCopy;
}) {
  const router = useRouter();
  const started = useRef(false);
  const [state, setState] = useState<
    { kind: "working" } | { kind: "missing" } | { kind: "failed"; message?: string }
  >({ kind: "working" });

  const finish = useCallback(
    () =>
      completePayment(checkoutId).then(
        (result) => {
          if (result.orderId)
            router.replace(
              `${successPath}?order=${encodeURIComponent(result.orderId)}`,
            );
          else if (result.missing) setState({ kind: "missing" });
          else setState({ kind: "failed", message: result.message });
        },
        () => setState({ kind: "failed" }),
      ),
    [checkoutId, router, successPath],
  );

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void finish();
  }, [finish]);

  if (state.kind === "working")
    return (
      <Frame>
        <p role="status" className="text-16 text-ink-muted text-center">
          {copy.finishing}
        </p>
      </Frame>
    );

  const ordersLink = (
    <Button asChild variant="outline">
      <Link href={ordersHref}>{copy.viewOrders}</Link>
    </Button>
  );

  return (
    <Frame>
      {state.kind === "missing" ? (
        <EmptyState
          icon={<Icon name="card" className="size-8" />}
          title={copy.missingTitle}
          description={copy.missingBody}
          action={ordersLink}
        />
      ) : (
        <EmptyState
          icon={<Icon name="card" className="size-8" />}
          title={copy.failedTitle}
          description={
            state.message ? `${state.message} ${copy.failedBody}` : copy.failedBody
          }
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                onClick={() => {
                  setState({ kind: "working" });
                  void finish();
                }}
              >
                {copy.retry}
              </Button>
              {ordersLink}
            </div>
          }
        />
      )}
    </Frame>
  );
}

function Failed({ cartHref, copy }: { cartHref: string; copy: OutcomeCopy }) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    void abandonPayment();
  }, []);

  return (
    <Frame>
      <EmptyState
        icon={<Icon name="card" className="size-8" />}
        title={copy.paymentFailedTitle}
        description={copy.paymentFailedBody}
        action={
          <Button asChild>
            <Link href={cartHref}>{copy.backToCart}</Link>
          </Button>
        }
      />
    </Frame>
  );
}

/** Closing the confirmation goes to the orders list. */
function Confirmed({
  order,
  homeHref,
  ordersHref,
  copy,
}: {
  order: PlacedOrder;
  homeHref: string;
  ordersHref: string;
  copy: ConfirmedCopy;
}) {
  const router = useRouter();
  return (
    <Frame>
      <ConfirmedModal
        open
        onOpenChange={(next) => !next && router.push(ordersHref)}
        order={order}
        homeHref={homeHref}
        copy={copy}
      />
    </Frame>
  );
}
