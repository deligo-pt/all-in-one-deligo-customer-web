/**
 * The cart screen's words.
 *
 * Its own namespace: two routes render these and the other seventy do not.
 *
 * Copy is transcribed from the `cart` frame (1440×2604). Where a string names
 * data rather than chrome — a store's name, "18.40€", "25–35 min", "#DG-8291"
 * — it is **not** here; those arrive from the API exactly as sent (Plan.md
 * §2.2). The verticals are named once, in the `nav` namespace, because the
 * header, the footer and this filter row must not be able to disagree about
 * what "Groceries" is called.
 *
 * Portuguese is not invented: `remove`, `orderSummary`, `chargeSubtotal`,
 * `chargeDelivery`, `chargeService`, `grandTotal`, `placeOrder`,
 * `addMoreItems`, `selectStore`, `selectedStore` and `chooseStore` are carried
 * verbatim from the old app's translation memory, which was written by people
 * (Plan.md §5).
 */
const cart = {
  title: "Your Cart",
  subtitle: "Everything you’ve picked from DeliGo, in one place.",

  // The header pill and each store's item count. One plural pair for both —
  // the file capitalises "Items" in one place and not the other, which is a
  // typo rather than a decision.
  items_one: "{count} item",
  items_other: "{count} items",

  filters: "Filter by service",
  filterAll: "All",

  // ── A store group ────────────────────────────────────────────────────────
  chooseStore: "Select this store to checkout",
  selectStore: "Select for Checkout",
  selectedStore: "Selected for Checkout",
  deliveryEstimate: "Delivery est:",
  remove: "Remove",
  quantity: "Quantity",
  increaseQuantity: "Increase quantity",
  decreaseQuantity: "Decrease quantity",
  itemImage: "Item photograph",

  // ── The order summary ────────────────────────────────────────────────────
  deliveryIn: "Delivery in",
  addMoreItems: "Add more items",
  applyVoucher: "Apply a voucher",
  orderSummary: "Order Summary",
  chargeSubtotal: "Subtotal",
  chargeDelivery: "Delivery Fee",
  chargeService: "Service Fee",
  chargeTip: "Rider Tip",
  chargeDiscount: "Discount",
  grandTotal: "Grand Total (incl. fees & tax)",
  placeOrder: "Place Order",

  // ── The three nothings, which are three different problems ───────────────
  emptyTitle: "Your cart is empty",
  emptyBody:
    "Nothing has been added yet. Choose a restaurant and whatever you pick shows up here.",
  browse: "Browse restaurants",

  unavailableTitle: "Your cart is not connected yet",
  unavailableBody:
    "This screen is built; the cart behind it is connected in a later phase. Nothing here is placeholder data — there is simply nothing to show until there is.",

  notWired:
    "The cart is not connected yet. This control is real and the request it would send arrives in a later phase — nothing was changed.",
} satisfies Record<string, string>;

export default cart;
