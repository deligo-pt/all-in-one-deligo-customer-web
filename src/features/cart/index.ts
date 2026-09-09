/**
 * The cart's public surface.
 *
 * One composed view, the transport contract, and the pure helpers a Server
 * Component needs to resolve the screen's counted strings before rendering.
 *
 * **Nothing heavy goes on this barrel.** A static import hands the importer
 * every export, and this project has now paid for that lesson three times —
 * 27 KB and 9.3 KB in Phase 6, 11 KB in Phase 8, each time because a modal or
 * a drawer was exported as a value from a barrel some unrelated route
 * imported. `CartView` is here because the only two pages that import this
 * barrel are the cart and its states page, and both render it; the row, the
 * group, the tabs and the summary panel are internals and `verify:structure`
 * forbids reaching past this file.
 */
export { CartView, type CartCopy } from "./CartView";
/**
 * The summary panel is exported because **both** importers of this barrel
 * render it: `/cart` draws it beside the store groups and `/checkout` draws
 * the same 415px panel beside the delivery and payment cards — it is one
 * component in the design, and a second copy in `features/checkout` is exactly
 * how the previous project ended up with seven pinks.
 *
 * That is the test the barrel rule has always been: a value export is a leak
 * when it reaches a route that never renders it, not merely because it is a
 * component. The rows, the tabs and the store group stay internal because
 * checkout renders none of them.
 */
export { OrderSummary, type SummaryCopy } from "./OrderSummary";
export { notWiredCart } from "./transport";
export { buildTabs, cartItemCount, storeItemCount } from "./summary";
export type { CartTab, TabId } from "./summary";
export { CART_VERTICALS, CartUnavailableError } from "./types";
export type {
  Cart,
  CartCharge,
  CartLine,
  CartStore,
  CartTotals,
  CartTransport,
  CartVertical,
  ChargeKind,
} from "./types";
