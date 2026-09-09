/**
 * What the cart needs from the backend, and nothing about how it arrives.
 *
 * Phase 9 builds the screen; **Phase 17** connects it to `/carts/view-cart`,
 * `/carts/add-to-cart` and `/carts/delete-item`. This file is the seam, and it
 * is a transcription of endpoints the old app already calls (Plan.md §2.2)
 * rather than a guess at a shape.
 *
 * **Money is a string, for the third phase running.** `18.40€` is what the
 * backend sends and what the customer must read. A `number` here would invite
 * a `toFixed(2)` at some call site, then a rounding rule, then a currency
 * symbol chosen by the frontend — and a cart that computes its own total is a
 * cart that can disagree with the checkout that charges it. `verify:cart`
 * fails on any arithmetic or conversion in this feature.
 *
 * **Quantity is a number, because it is a count and not a price.** The one
 * sum this feature is allowed to do is "how many items are in the cart".
 */

/**
 * The verticals that can hold a cart line.
 *
 * Three, not six: a ride, a hotel night and a parcel are booked, not added to
 * a basket, and the design's tab row names exactly these — `All · Food ·
 * Groceries · Electronics`. The tabs themselves are derived from what the cart
 * actually holds (`buildTabs`), so a cart with no groceries in it has no
 * Groceries tab.
 */
export type CartVertical = "food" | "groceries" | "electronics";

export const CART_VERTICALS: readonly CartVertical[] = [
  "food",
  "groceries",
  "electronics",
];

/**
 * One line in the cart.
 *
 * `id` is the **line's** id, not the product's. The old app learned this the
 * expensive way: its cart keys on the Mongo `_id` of the line, because the
 * same dish ordered twice with different options is two lines and keying on
 * `productId` merges them. `productId` is carried separately because it is
 * what a "buy this again" or an add-on request needs.
 */
export type CartLine = {
  id: string;
  productId: string;
  name: string;
  description?: string;
  image?: string;
  /** Verbatim, symbol included: "12.50€". */
  price: string;
  quantity: number;
  /** "Large · Extra cheese" — the chosen options, joined by the API. Without
   *  it two lines of the same dish are indistinguishable on screen. */
  optionsLabel?: string;
};

/**
 * The rows of the order summary.
 *
 * A closed set rather than a `{ label, amount }` pair, and that is the
 * i18n decision: the *label* is chrome and belongs in the dictionary in both
 * languages, the *amount* is the backend's and is printed exactly as sent. A
 * backend-supplied label would arrive in one language and be untranslatable.
 */
export type ChargeKind = "subtotal" | "delivery" | "service" | "tip" | "discount";

export type CartCharge = {
  kind: ChargeKind;
  /** Verbatim, sign included: "2.99€", "-6.50€". */
  amount: string;
  /** The voucher's code, shown beside the discount row: "DELIGO20". */
  code?: string;
};

export type CartTotals = {
  charges: readonly CartCharge[];
  /** Verbatim: "30.97€". Never the sum of `charges` — that is the backend's
   *  arithmetic and this screen is not entitled to a second opinion on it. */
  total: string;
};

/**
 * Everything from one store, which is also everything in one order.
 *
 * The grouping is not presentational. D-4 assumes the backend cannot place a
 * single order across two vendors, so a store group *is* the unit that gets
 * checked out — which is why it carries its own totals and its own order
 * reference rather than the cart carrying one of each.
 */
export type CartStore = {
  id: string;
  vendorId: string;
  name: string;
  vertical: CartVertical;
  lines: readonly CartLine[];
  /** Verbatim: "18.40€". */
  subtotal: string;
  /** "25–35 min" — the sentence's numbers only; the words are ours. */
  deliveryEstimate?: string;
  /** "#DG-8291". */
  orderRef?: string;
  totals: CartTotals;
};

export type Cart = {
  stores: readonly CartStore[];
  /**
   * The whole cart's value, exactly as the backend states it.
   *
   * Optional, and the option is the honest part: with checkout per store there
   * may be no such number, and adding up the stores here to fill the header
   * pill would be inventing one. When it is absent the header shows the item
   * count alone.
   */
  total?: string;
};

/**
 * What Phase 17 implements.
 *
 * `setQuantity` rather than `increment`, because that is what the endpoint
 * does: the old app's `/carts/add-to-cart` **sets** the quantity of a line and
 * does not add to it, and an interface here that promised increments would
 * have to fake them on top of a set — which is how two tabs of the same cart
 * end up disagreeing.
 *
 * Each returns the whole cart, because a quantity change moves a subtotal, a
 * delivery fee and a discount threshold, and the only place that knows how is
 * the server.
 */
export type CartTransport = {
  /** `/carts/view-cart`. */
  read(): Promise<Cart>;
  /** `/carts/add-to-cart` — sets, never adds. Zero removes the line. */
  setQuantity(lineId: string, quantity: number): Promise<Cart>;
  /** `/carts/delete-item`. */
  remove(lineId: string): Promise<Cart>;
};

export class CartUnavailableError extends Error {
  constructor() {
    super("cart-not-wired");
    this.name = "CartUnavailableError";
  }
}
