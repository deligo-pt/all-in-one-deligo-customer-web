import { Badge } from "@/components/ui/Badge";
import { Icon, type IconName } from "@/components/ui/Icon";
import { CartLineRow, type LineCopy } from "./CartLineRow";
import type { CartStore, CartVertical } from "./types";

export type StoreCopy = LineCopy & {
  chooseStore: string;
  selectStore: string;
  selectedStore: string;
  deliveryEstimate: string;
  subtotal: string;
  verticalLabel: Record<CartVertical, string>;
};

/**
 * Which glyph marks a vertical.
 *
 * A `Record`, not a function: this object is built on the server and handed to
 * a client component, and a function cannot cross that boundary — the lesson
 * `FilterCopy` taught in Phase 7, where a `(k) => string` failed the build at
 * export time.
 */
const VERTICAL_ICON: Record<CartVertical, IconName> = {
  food: "food",
  groceries: "groceries",
  electronics: "electronics",
};

/**
 * Everything from one store — which, under D-4, is everything in one order.
 *
 * Measured: 864 wide at 16px radius over a `line` border, 24px inside; a
 * header carrying the store's name at 20/600 with its vertical beneath it and
 * an item count on the end, all above a 24px rule; the lines at 24px apart;
 * and a footer with the delivery estimate at 14/500 against `Subtotal: 18.40€`
 * at 24/600.
 *
 * ## The one thing here the design does not draw
 *
 * The design shows three store groups and, beside them, a summary panel
 * belonging to **one** store — its name, its delivery estimate, its order
 * reference, its `Place Order`. Nothing in the file says which. Under D-4's
 * default the answer cannot be "all of them", so the customer chooses, and the
 * old app is the precedent rather than an invention: it has this exact control
 * and these exact words — "Select for Checkout" / "Selected for Checkout".
 *
 * It is a real `<input type="radio">` inside a label, visually a chip. A radio
 * group because the choice is one-of-many; native because that is arrow-key
 * navigation, a group name and a single tab stop for free, and none of it
 * shipped as JavaScript.
 */
export function StoreGroup({
  store,
  copy,
  itemsLabel,
  selected,
  onSelect,
  groupName,
  onQuantityChange,
  onAddonQuantityChange,
  onRemove,
  busy,
}: {
  store: CartStore;
  copy: StoreCopy;
  /** "2 items", already pluralised on the server. */
  itemsLabel: string;
  selected: boolean;
  onSelect: (storeId: string) => void;
  /** Shared by every radio in the list — that is what makes them one group. */
  groupName: string;
  onQuantityChange: (lineId: string, quantity: number) => void;
  onAddonQuantityChange?: (lineId: string, optionSku: string, quantity: number) => void;
  onRemove: (lineId: string) => void;
  busy?: boolean;
}) {
  return (
    <section
      aria-label={store.name}
      className="border-line rounded-16 bg-surface flex flex-col gap-6 border p-6"
    >
      <header className="border-line flex flex-wrap items-start justify-between gap-4 border-b pb-6">
        <div className="flex flex-col items-start gap-1">
          <h3 className="text-20 text-ink-strong font-semibold">{store.name}</h3>
          <Badge tone="warm" className="font-semibold">
            <Icon name={VERTICAL_ICON[store.vertical]} className="size-3" />
            {copy.verticalLabel[store.vertical]}
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <label
            className={[
              "text-14 inline-flex h-9 cursor-pointer items-center rounded-full border px-6 font-medium transition-colors",
              selected
                ? "border-brand bg-brand text-ink-inverse"
                : "border-line text-ink hover:bg-surface-muted",
            ].join(" ")}
          >
            <input
              type="radio"
              name={groupName}
              className="sr-only"
              checked={selected}
              onChange={() => onSelect(store.id)}
            />
            {selected ? copy.selectedStore : copy.selectStore}
          </label>
          {/* "1 item · 8.00€" — the count and this store's own total, the
              line the old app's store card carried. The total is the API's
              per-store number; nothing here adds up a column. */}
          <Badge tone="neutral" className="text-14">
            {store.subtotal ? `${itemsLabel} · ${store.subtotal}` : itemsLabel}
          </Badge>
        </div>
      </header>

      <div className="flex flex-col gap-6">
        {store.lines.map((line) => (
          <CartLineRow
            key={line.id}
            line={line}
            copy={copy}
            busy={busy}
            onQuantityChange={onQuantityChange}
            onAddonQuantityChange={onAddonQuantityChange}
            onRemove={onRemove}
          />
        ))}
      </div>

      {store.deliveryEstimate ? (
        <footer className="border-line border-t pt-4">
          <p className="text-14 text-ink-warm flex items-center gap-2 font-medium">
            <Icon name="clock" className="text-brand-strong size-4" />
            {`${copy.deliveryEstimate} ${store.deliveryEstimate}`}
          </p>
        </footer>
      ) : null}
    </section>
  );
}
