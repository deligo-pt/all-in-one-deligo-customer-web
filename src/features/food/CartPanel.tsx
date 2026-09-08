import { Icon } from "@/components/ui/Icon";

/**
 * The cart, beside the menu.
 *
 * Measured: 416 wide, 16px radius, a `line` border, the title at 20/600, and
 * an empty state centred beneath it.
 *
 * **Empty is the only state this phase builds, and it is not a placeholder.**
 * It is what every customer sees on arrival, it is what the design draws, and
 * it is the state the cart spends most of its life in. The populated panel —
 * lines, quantities, totals, the checkout button — is Phase 9's, over the
 * `/carts/view-cart` shape Phase 17 wires. Guessing at it now would mean
 * inventing prices, which is the one thing this project does not do.
 *
 * The design puts a Lottie illustration here. There is no licensed asset for
 * it, so the slot is an icon in a tinted circle: obviously ours, obviously not
 * the final artwork, and it does not pretend otherwise.
 */
export function CartPanel({
  title,
  emptyLabel,
}: {
  title: string;
  emptyLabel: string;
}) {
  return (
    <section
      aria-label={title}
      className="border-line rounded-16 bg-surface flex flex-col gap-8 border p-6"
    >
      <h2 className="text-20 text-ink font-semibold">{title}</h2>
      <div className="flex flex-col items-center gap-8 py-8">
        <span
          aria-hidden
          className="bg-brand-tint text-brand flex size-32 items-center justify-center rounded-full"
        >
          <Icon name="cart" className="size-12" />
        </span>
        <p className="text-16 text-ink-muted font-medium">{emptyLabel}</p>
      </div>
    </section>
  );
}
