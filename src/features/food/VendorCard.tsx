import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { ImageSlot } from "@/components/shared/ImageSlot";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n/locale";
import { withLocale } from "@/lib/i18n/path";
import { ROUTES } from "@/lib/routes";
import type { Vendor } from "./types";

/**
 * One restaurant in the listing.
 *
 * Measured: 304×315, 16px radius, a `line` border; a 302×168 photograph with
 * the discount pill inset 12; then a 286px body on 14px gaps — name at 20/600
 * beside a rating chip, the cuisines at 14/400, distance and time at 12/400
 * either side of a 3px dot, and a ruled footer carrying the opening status.
 *
 * **The status colour is corrected.** The file paints "Open now · Closes at
 * 11:30 PM" in the same red as "Closing soon", which reads as a warning on a
 * store that is simply open. Open is `success`, closing soon is `warning`, and
 * closed is `danger` — three states, three colours, which is what the sentence
 * already says in words.
 *
 * Every value here is the backend's own string. Nothing is formatted, rounded
 * or recomputed: "4.8" and "20–30 min" arrive that way and leave that way.
 */
const STATUS_TONE = {
  open: "text-success",
  "closing-soon": "text-warning",
  closed: "text-danger",
} as const;

export function VendorCard({
  vendor,
  locale,
  imageLabel,
  ratingLabel,
}: {
  vendor: Vendor;
  locale: Locale;
  /** Alt text for a missing photograph — the vendor's name is not enough. */
  imageLabel: string;
  ratingLabel: string;
}) {
  return (
    <Link
      href={withLocale(ROUTES.vendor.path.replace("[vendorId]", vendor.id), locale)}
      className="border-line rounded-16 bg-surface group flex flex-col overflow-hidden border transition-shadow hover:shadow-md"
    >
      <div className="relative">
        <ImageSlot
          src={vendor.image}
          alt={vendor.name || imageLabel}
          sizes="(max-width: 768px) 100vw, 304px"
          className="aspect-16/9 w-full"
        />
        {vendor.discountLabel ? (
          <span className="bg-brand text-ink-inverse text-12 absolute start-3 top-3 inline-flex items-center gap-1 rounded-full px-2 py-1 font-medium">
            <Icon name="tag" className="size-4" />
            {vendor.discountLabel}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3.5 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-20 text-ink font-semibold">{vendor.name}</h3>
          {vendor.rating ? (
            <span
              className="bg-brand-tint border-brand-soft text-12 text-ink inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 font-medium"
              aria-label={`${ratingLabel} ${vendor.rating}`}
            >
              <Icon name="star" className="text-brand size-4" />
              {vendor.rating}
            </span>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          {vendor.cuisines.length ? (
            <p className="text-14 text-ink-muted">{vendor.cuisines.join(" · ")}</p>
          ) : null}
          <p className="text-12 text-ink-muted flex items-center gap-2">
            {vendor.distance ? <span>{vendor.distance}</span> : null}
            {vendor.distance && vendor.deliveryTime ? (
              <span aria-hidden className="bg-ink-muted size-1 rounded-full" />
            ) : null}
            {vendor.deliveryTime ? <span>{vendor.deliveryTime}</span> : null}
          </p>
        </div>

        {vendor.statusDetail ? (
          <p
            className={cn(
              "border-line text-12 mt-auto border-t pt-3 text-center font-medium",
              STATUS_TONE[vendor.status],
            )}
          >
            {vendor.statusDetail}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
