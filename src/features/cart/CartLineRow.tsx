import { Button } from "@/components/ui/Button";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { ImageSlot } from "@/components/shared/ImageSlot";
import type { CartLine } from "./types";

export type LineCopy = {
  remove: string;
  quantity: string;
  increase: string;
  decrease: string;
  itemImage: string;
};

/**
 * One line in a store's group.
 *
 * Measured from the `cart` frame: an 816-wide row, a 96px photograph at 12px
 * radius, the name and the price on one line at 14/600, a two-line description
 * at 14/400 in `ink-warm`, then 16px of space and a row holding `Remove` at
 * 12/600 in brand against the stepper on the end.
 *
 * ## The options line is added, and it is not decoration
 *
 * The design shows a name and a description. A cart made of dishes with
 * options cannot be read that way: "Pepperoni Lovers Medium" twice, once large
 * with extra cheese and once not, is two rows that look identical and one of
 * them is about to be removed by mistake. `optionsLabel` is what the API
 * already joins for the order screens, and it is rendered here beneath the
 * description.
 *
 * ## Neither control is disabled while the cart is not connected
 *
 * They press, the transport refuses, and the view says so. Phase 8 settled
 * this: a disabled button cannot explain why it is disabled.
 */
export function CartLineRow({
  line,
  copy,
  onQuantityChange,
  onRemove,
  busy,
}: {
  line: CartLine;
  copy: LineCopy;
  onQuantityChange: (lineId: string, quantity: number) => void;
  onRemove: (lineId: string) => void;
  busy?: boolean;
}) {
  return (
    <article className="flex gap-4">
      <ImageSlot
        src={line.image}
        alt={copy.itemImage}
        sizes="96px"
        className="rounded-12 size-24 shrink-0"
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-4">
          <h4 className="text-14 text-ink-strong font-semibold">{line.name}</h4>
          {/* Verbatim. The API sends "12.50€" and that is what is read. */}
          <p className="text-14 text-ink-strong shrink-0 font-semibold">{line.price}</p>
        </div>

        {line.description ? (
          <p className="text-14 text-ink-warm mt-1 line-clamp-2">{line.description}</p>
        ) : null}
        {line.optionsLabel ? (
          <p className="text-12 text-ink-muted mt-1">{line.optionsLabel}</p>
        ) : null}

        <div className="mt-4 flex items-center justify-between gap-4">
          <Button
            variant="link"
            className="text-12 font-semibold"
            aria-label={`${copy.remove} ${line.name}`}
            disabled={busy}
            onClick={() => onRemove(line.id)}
          >
            {copy.remove}
          </Button>
          <QuantityStepper
            variant="pill"
            value={line.quantity}
            // One is the floor, not zero: the design puts removal on its own
            // control, and a stepper that quietly deletes the line at the
            // bottom of its range is a control with two meanings.
            min={1}
            disabled={busy}
            onChange={(next) => onQuantityChange(line.id, next)}
            quantityLabel={`${copy.quantity} — ${line.name}`}
            increaseLabel={`${copy.increase} — ${line.name}`}
            decreaseLabel={`${copy.decrease} — ${line.name}`}
          />
        </div>
      </div>
    </article>
  );
}
