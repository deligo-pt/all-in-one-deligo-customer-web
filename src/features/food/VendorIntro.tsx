import { Icon } from "@/components/ui/Icon";
import { ImageSlot } from "@/components/shared/ImageSlot";
import { DealCard } from "./DealCard";
import type { VendorDetail } from "./types";

/**
 * The top of a store's page: the 448px hero at 16px radius, the name at 32/600
 * over the address at 16/400 and a 14/400 meta row, then the deals as 280×172
 * cards. `food Home` (2633) and `gro Home` (2719) draw it identically, so it
 * is one component with two pages under it.
 */
export function VendorIntro({
  vendor,
  dealsTitle,
  dealsSubtitle,
}: {
  vendor: Omit<VendorDetail, "menu">;
  dealsTitle: string;
  dealsSubtitle: string;
}) {
  const meta = [
    vendor.cuisines.join(" · ") || null,
    vendor.deliveryTime ?? null,
  ].filter(Boolean);

  return (
    <>
      <ImageSlot
        src={vendor.heroImage}
        alt={vendor.name}
        sizes="(max-width: 1440px) 100vw, 1312px"
        className="rounded-16 aspect-[1312/448] w-full"
      />

      <header className="flex flex-col gap-3">
        <h1 className="text-32 text-ink font-semibold">{vendor.name}</h1>
        {vendor.address ? (
          <p className="text-16 text-ink-muted flex items-center gap-2">
            <Icon name="location" className="size-4 shrink-0" />
            {vendor.address}
          </p>
        ) : null}
        <p className="text-14 text-ink-muted flex flex-wrap items-center gap-2">
          {vendor.rating ? (
            <span className="text-ink inline-flex items-center gap-1 font-semibold">
              <Icon name="star" className="text-rating size-4" />
              {vendor.rating}
              {vendor.reviewsLabel ? (
                <span className="font-medium"> {vendor.reviewsLabel}</span>
              ) : null}
            </span>
          ) : null}
          {meta.map((entry) => (
            <span key={entry} className="flex items-center gap-2">
              <span aria-hidden>·</span>
              {entry}
            </span>
          ))}
        </p>
      </header>

      {vendor.deals.length ? (
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-20 text-ink font-semibold">{dealsTitle}</h2>
            <p className="text-16 text-ink-muted">{dealsSubtitle}</p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {vendor.deals.map((deal) => (
              <li key={deal.id}>
                <DealCard deal={deal} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
