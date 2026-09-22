"use client";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { ImageSlot } from "@/components/shared/ImageSlot";
import type { MenuItem } from "./types";

/**
 * One dish on a vendor's menu.
 *
 * Measured: 416×149, 16px radius, a `line` border, 16px inside; a 123×114
 * photograph at 8px radius; the name at 16/500 over a two-line description at
 * 14/400; the price at 16/600 in brand, and a 30px round add button filled
 * `brand-tint`.
 *
 * The badge — "BESTSELLER", "20% OFF" — is the vendor's own merchandising flag
 * and is rendered exactly as it arrives. The design sets it at 8/600, which is
 * below the smallest step on the type scale for a reason: it is a label on a
 * label. It is the one place in the application that uses `text-8`.
 *
 * **Adding is Phase 17's.** The button is real, focusable and labelled, and it
 * does nothing yet — `/carts/add` and the option modal that has to come before
 * it for a dish with variations are the cart phase's work, not this one's.
 */
export function MenuItemCard({
  item,
  addLabel,
  onAdd,
}: {
  item: MenuItem;
  addLabel: string;
  onAdd?: (itemId: string) => void;
}) {
  return (
    // `min-w-0`: a grid item will not shrink below its content unless told to.
    // The photo is 80px below `sm` — at 112px a 320px phone left 126px for the
    // name, the badge, the price and the add button, and the card spilled.
    <article className="border-line rounded-16 bg-surface flex min-w-0 gap-3 border p-4 sm:gap-4">
      <ImageSlot
        src={item.image}
        alt={item.name}
        sizes="(min-width: 640px) 112px, 80px"
        className="rounded-8 size-20 shrink-0 sm:size-28"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-col gap-2">
            <h4 className="text-16 text-ink font-medium">{item.name}</h4>
            {item.description ? (
              <p className="text-14 text-ink-muted line-clamp-2">{item.description}</p>
            ) : null}
          </div>
          {item.badge ? (
            <span className="bg-brand-tint text-brand text-8 shrink-0 rounded-full px-2 py-1 font-semibold tracking-wide">
              {item.badge}
            </span>
          ) : null}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3">
          {/* Verbatim. The API sends "9.90€" and that is what is read out —
              no re-formatting, no symbol chosen here. */}
          <p className="text-16 text-brand flex min-w-0 flex-wrap items-baseline gap-x-2 font-semibold">
            {item.price}
            {item.originalPrice ? (
              <s className="text-12 text-ink-muted font-normal">{item.originalPrice}</s>
            ) : null}
          </p>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label={`${addLabel} ${item.name}`}
            onClick={onAdd ? () => onAdd(item.id) : undefined}
            className="bg-brand-tint text-brand hover:bg-brand-pale size-8"
          >
            <Icon name="plus" className="size-4" />
          </Button>
        </div>
      </div>
    </article>
  );
}
