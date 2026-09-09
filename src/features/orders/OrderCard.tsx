import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ImageSlot } from "@/components/shared/ImageSlot";
import type { Order } from "./types";

export type OrderCardCopy = {
  track: string;
  details: string;
  reorder: string;
  orderImage: string;
};

/**
 * One order in the list.
 *
 * Measured from the mobile `order` frames (D-15): the vendor at 20/600, the
 * items line at 14/400 in `ink-muted`, the reference at 12/500, a status pill,
 * the total at 20/600 in brand, and one or two actions.
 *
 * The card is a `Link`, so it opens in a new tab on a middle click and is
 * reachable by keyboard — the same rule `VendorCard` follows. The actions sit
 * outside it rather than nested inside, because a button inside a link is a
 * control neither of them can own.
 */
export function OrderCard({
  order,
  detailHref,
  onReorder,
  copy,
}: {
  order: Order;
  detailHref: string;
  onReorder?: (orderId: string) => void;
  copy: OrderCardCopy;
}) {
  return (
    <article className="border-line rounded-16 bg-surface flex flex-col gap-4 border p-4 sm:flex-row">
      <ImageSlot
        src={order.image}
        alt={copy.orderImage}
        sizes="96px"
        className="rounded-12 size-24 shrink-0"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <Link
            href={detailHref}
            className="text-20 text-ink font-semibold hover:underline"
          >
            {order.vendorName}
          </Link>
          {/* Verbatim. The API sends "15.60€". */}
          <p className="text-20 text-brand font-semibold">{order.total}</p>
        </div>

        <p className="text-14 text-ink-muted">{order.itemsLabel}</p>

        <div className="text-12 text-ink-muted flex flex-wrap items-center gap-3 font-medium">
          <span>{order.reference}</span>
          <span>{order.placedOn}</span>
          <Badge tone={order.bucket === "ongoing" ? "warning" : "success"}>
            {order.statusLabel}
          </Badge>
          {order.eta ? (
            <span className="text-16 text-ink font-semibold">{order.eta}</span>
          ) : null}
        </div>

        <div className="mt-1 flex flex-wrap gap-3">
          <Button asChild size="sm" variant={order.step ? "primary" : "outline"}>
            <Link href={detailHref}>{order.step ? copy.track : copy.details}</Link>
          </Button>
          {order.canReorder && onReorder ? (
            <Button
              size="sm"
              variant="link"
              className="text-14 font-semibold"
              onClick={() => onReorder(order.id)}
            >
              {copy.reorder}
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
