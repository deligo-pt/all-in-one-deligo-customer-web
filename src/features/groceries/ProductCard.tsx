import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { ImageSlot } from "@/components/shared/ImageSlot";
import type { GroceryProduct } from "./types";

/**
 * One product on a shelf — the `Product Card` component, 198×236.
 *
 * Measured: white on a `line` hairline (the file's 30% `brand-soft`) at 16px radius, 13px inside; a
 * 172×128 photograph at 12; the name at 14/600, the unit at 12/500 muted, the
 * price at 20/600 in brand, and a 30px filled add button on the end.
 *
 * **The favourite heart on the photograph is not drawn.** No favourites
 * endpoint is known, and a heart that fills and forgets is worse than none.
 * **Adding** (Phase 17) sets the line to what the cart holds plus one; the
 * store page does the write and re-reads the cart.
 */
export function ProductCard({
  product,
  addLabel,
  onAdd,
  busy = false,
}: {
  product: GroceryProduct;
  addLabel: string;
  onAdd: () => void;
  busy?: boolean;
}) {
  return (
    <article className="border-line rounded-16 bg-surface flex h-full flex-col gap-2 border p-3">
      <ImageSlot
        src={product.image}
        alt={product.name}
        sizes="172px"
        className="rounded-12 aspect-[172/128] w-full"
      />
      <h3 className="text-14 text-ink mt-2 font-semibold">{product.name}</h3>
      {product.unit ? (
        <p className="text-12 text-ink-muted font-medium">{product.unit}</p>
      ) : null}
      <div className="mt-auto flex items-center justify-between gap-2 pt-2">
        {/* Verbatim: "1.99€". */}
        <p className="text-20 text-brand font-semibold">{product.price}</p>
        <Button
          size="icon-sm"
          aria-label={`${addLabel} ${product.name}`}
          onClick={onAdd}
          loading={busy}
        >
          <Icon name="plus" className="size-4" />
        </Button>
      </div>
    </article>
  );
}
