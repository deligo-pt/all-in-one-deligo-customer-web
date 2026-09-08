/**
 * What the food vertical needs from the catalogue, and nothing about how it
 * arrives.
 *
 * Phase 7 builds the screens; **Phase 16** connects them to
 * `/vendors/nearby/open/:id`, `/vendors/customer/:id`, `/products` and
 * `/categories/cuisine`. This file is the seam, written now so the UI is built
 * against a contract rather than against whatever shape the API turns out to
 * have — and the old app proves every one of those endpoints exists (Plan.md
 * §2.2), so this is a transcription of a known contract, not a guess.
 *
 * **Money is a string, deliberately.** `9.90€` is what the backend sends and
 * what the customer must read; a `number` here would invite a `toFixed(2)` at
 * some call site, then a rounding rule, then a currency symbol chosen by the
 * frontend. The rule Plan.md §2.2 carries from the old app is that discount,
 * rating and money values are displayed exactly as returned. A type that
 * cannot hold a float cannot quietly re-derive one.
 */

/** Whether a store can be ordered from right now. */
export type VendorStatus = "open" | "closing-soon" | "closed";

export type Vendor = {
  id: string;
  name: string;
  /** The card's photograph. Absent is normal and renders as a placeholder. */
  image?: string;
  /** "Burgers · Fast Food" — joined by the API, not by us. */
  cuisines: readonly string[];
  /** Exactly as returned: "4.8". Never recomputed, never rounded. */
  rating?: string;
  /** "1.2 mi". The unit is the backend's choice. */
  distance?: string;
  /** "20–30 min". */
  deliveryTime?: string;
  status: VendorStatus;
  /** "Closes at 11:30 PM", "Closes in 35 min" — the sentence, already localised. */
  statusDetail?: string;
  /** "30% OFF" on the image, when there is one. */
  discountLabel?: string;
};

export type Cuisine = {
  id: string;
  name: string;
  image?: string;
};

/** One of the offers a vendor is running, from `/offers/available`. */
export type Deal = {
  id: string;
  /** The pill: "Up to 30% OFF". */
  badge: string;
  title: string;
  description: string;
  /** "Automatically applied · Max discount 6€". */
  terms?: string;
};

export type MenuItem = {
  id: string;
  name: string;
  description?: string;
  image?: string;
  /** Verbatim from the API, symbol included. */
  price: string;
  /** "BESTSELLER", "20% OFF" — the vendor's own merchandising flag. */
  badge?: string;
};

/**
 * One choice inside an option group — a size, a crust, a topping.
 *
 * `priceDelta` is the backend's own phrasing: "Include", "+4.50€". Not a
 * number and not a sign plus a number, because "included" and "free" and
 * "+0.00€" are three different sentences a market may want and only one of
 * them can be derived from zero.
 */
export type OptionChoice = {
  id: string;
  name: string;
  priceDelta?: string;
  soldOut?: boolean;
};

/**
 * A group of choices: `variations` on the product, or an add-on group fetched
 * from `/add-ons/:id`.
 *
 * `minSelectable` is what makes a group required, and the old app learned to
 * enforce it before calling the cart rather than after — the backend rejects
 * the line, and the rejection names a group the customer cannot see from the
 * error. `maxSelectable` above one is what makes it a checkbox group rather
 * than a radio group; that is the only thing that decides the control.
 */
export type OptionGroup = {
  id: string;
  name: string;
  minSelectable: number;
  maxSelectable: number;
  choices: readonly OptionChoice[];
};

/** A menu item with everything needed to order it. `/products/:id` plus one
 *  `/add-ons/:id` per group — two requests, which is why this is its own type
 *  rather than fields on `MenuItem`. */
export type ProductDetail = MenuItem & {
  options: readonly OptionGroup[];
};

/** A menu section, in the order the API returned it. */
export type MenuCategory = {
  id: string;
  name: string;
  items: readonly MenuItem[];
};

export type VendorDetail = Vendor & {
  address?: string;
  /** "(10k+ Reviews)" — a label, not a count to be formatted. */
  reviewsLabel?: string;
  heroImage?: string;
  deals: readonly Deal[];
  menu: readonly MenuCategory[];
};

/** The listing's filter state. Owned by the client; sent to the API in Phase 16. */
export type SortOption = "recommended" | "best-value" | "price-asc" | "price-desc";
export type DeliveryOption = "instant" | "pickup";

export type FoodFilters = {
  sort: SortOption;
  delivery: readonly DeliveryOption[];
  deals: readonly string[];
  dietary: readonly string[];
  cuisines: readonly string[];
};

export const EMPTY_FILTERS: FoodFilters = {
  sort: "recommended",
  delivery: [],
  deals: [],
  dietary: [],
  cuisines: [],
};

/**
 * What Phase 16 implements.
 *
 * Every method resolves or throws. There is no `{ ok: false }`: a catalogue
 * that cannot be read is exceptional, the pages have one place that catches
 * it, and a result type would put a branch at every call site that would
 * eventually be forgotten at one of them.
 */
export type FoodCatalog = {
  /** `/vendors/nearby/open/:id` — the listing, already filtered by the API. */
  listVendors(filters: FoodFilters): Promise<readonly Vendor[]>;
  /** `/categories/cuisine` — the circles above the listing. */
  listCuisines(): Promise<readonly Cuisine[]>;
  /** `/vendors/customer/:id` plus its products, as one screen's worth. */
  getVendor(vendorId: string): Promise<VendorDetail>;
  /** `/products/:id`, plus one `/add-ons/:id` per group it references. Its own
   *  read because the listing does not carry option groups — the old app made
   *  exactly these calls, and the second one needs a session. */
  getProduct(productId: string): Promise<ProductDetail>;
};

export class CatalogUnavailableError extends Error {
  constructor() {
    super("catalog-not-wired");
    this.name = "CatalogUnavailableError";
  }
}
