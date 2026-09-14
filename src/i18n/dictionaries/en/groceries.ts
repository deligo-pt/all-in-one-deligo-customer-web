/**
 * The grocery vertical and the electronics launch notice (Phase 13).
 *
 * Only what groceries say differently. The rail, the delivery bar, the deals
 * heading and the cart panel's words are `food`'s and `cart`'s, loaded beside
 * this namespace — the same sentence translated twice drifts.
 */
const groceries = {
  heroBadge: "New: Fresh groceries are here",
  heroTitleLead: "Your Favorite Groceries,",
  heroTitleAccent: "Delivered Fresh.",
  heroBody:
    "From fresh produce to everyday essentials, discover quality groceries from trusted stores near you—delivered fast, fresh, and right to your door.",
  seeGroceries: "See Groceries",

  allStores: "Grocery stores",
  storesAvailable: "stores available at your location",
  noLocationBody:
    "Set your address or use your current location, and we’ll show the stores that deliver there.",
  storeImage: "Store photograph",
  noStores: "No stores match these filters",
  noStoresBody: "No grocery store delivers to this address yet.",
  storesUnavailable: "Grocery stores are unavailable right now",
  storesUnavailableBody:
    "We couldn’t reach the store list just now. Try again in a moment.",

  searchStore: "Search this store",
  aisleNavigation: "Store categories",
  noProducts: "No products match that search",
  noProductsBody: "Try a shorter word, or clear the search to see the whole store.",
  storeEmpty: "This store hasn’t added its products yet",
  storeEmptyBody: "Check back soon, or pick another store nearby.",
  fulfilment: "When to deliver",
  modeInstant: "Instant",
  modeSchedule: "Schedule",
  checkout: "Checkout",
  storeUnavailable: "This store is unavailable right now",
  storeUnavailableBody: "We couldn’t load this store just now. Try again in a moment.",

  electronicsBadge: "Launching soon",
  electronicsTitle: "We’re Coming Soon.",
  electronicsBody: "We’re working on something exciting.",
  electronicsImageAlt: "A laptop, headphones and a phone on a desk at night",
} satisfies Record<string, string>;

export default groceries;
