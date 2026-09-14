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
  /** The vendor's `userId` ("V-…"). `/vendors/nearby/open/:id` 404s on the
   *  Mongo `_id`, which is what products reference instead. */
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
  /** The slug `restaurantCuisineType=` takes — never the display name. */
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
  /** The price to pay, formatted once from the API's `finalPrice`. */
  price: string;
  /** The price before the vendor's discount, when there is one. */
  originalPrice?: string;
  /** "20% OFF" — the vendor's own discount, as sent. */
  badge?: string;
  /** Variation groups, carried on the product itself (Phase 16). */
  options?: readonly OptionGroup[];
  /** Add-on group ids. The groups need a session (`/add-ons/:id`) and load
   *  when the dish is opened, never with the menu. */
  addonGroupIds?: readonly string[];
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
  /** A size is sent as `variationSku`, an add-on as `addons[].optionSku`
   *  (Phase 17). Absent is a variation. */
  kind?: "variation" | "addon";
  name: string;
  minSelectable: number;
  maxSelectable: number;
  choices: readonly OptionChoice[];
};

/** A menu item with every option group resolved — its variations plus the
 *  add-on groups fetched when the dish is opened. */
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
  /** The Mongo `_id` — what products and cart lines reference the vendor by. */
  recordId?: string;
  address?: string;
  /** "(10k+ Reviews)" — a label, not a count to be formatted. */
  reviewsLabel?: string;
  heroImage?: string;
  deals: readonly Deal[];
  menu: readonly MenuCategory[];
};

/** One page of the listing. `countLabel` is the API's total, formatted. */
export type VendorPage = {
  vendors: readonly Vendor[];
  countLabel?: string;
};

/** Where the listing is for. Structural, so the feature does not import the
 *  location module; `@/lib/location`'s `DeliveryLocation` satisfies it. */
export type ListingLocation = { latitude: number; longitude: number; label: string };

/**
 * The catalogue contract, implemented against the API in
 * `services/catalog/food.ts` (Phase 16). Every method resolves or throws.
 */
export type FoodCatalog = {
  /** `/vendors/nearby/open` — restaurants near a location, filtered by the API. */
  listVendors(input: {
    cuisine?: string;
    location: ListingLocation;
  }): Promise<VendorPage>;
  /** `/categories/cuisine/open`. */
  listCuisines(): Promise<readonly Cuisine[]>;
  /** `/vendors/nearby/open/:userId`, its products and its product categories. */
  getVendor(vendorId: string): Promise<VendorDetail>;
};
