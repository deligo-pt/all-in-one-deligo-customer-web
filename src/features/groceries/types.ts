import type { ListingLocation, Vendor, VendorDetail } from "@/features/food";

/**
 * What the grocery screens need from the catalogue.
 *
 * Unlike the verticals D-6 flags, groceries have a backend: the old app reads
 * `/categories/businessCategory/open` and `/categories/productCategory/open`,
 * and a store is a vendor like any other. **Phase 16** connects this seam; the
 * shapes are the food catalogue's wherever the design draws the same thing.
 *
 * Money and ratings are strings, as everywhere: "1.99€" and "4.8" arrive that
 * way and leave that way.
 */

/** One item on a shelf. `unit` is the backend's sentence — "1kg (approx. 6
 *  units)", "500 mL or 1L or 2L" — never a quantity to be multiplied. */
export type GroceryProduct = {
  id: string;
  name: string;
  unit?: string;
  price: string;
  image?: string;
};

/** A product category inside a store — "Fruit", "Vegetables" — in API order. */
export type Aisle = {
  id: string;
  name: string;
  products: readonly GroceryProduct[];
};

export type GroceryStore = Omit<VendorDetail, "menu"> & {
  aisles: readonly Aisle[];
};

/** A titled row of stores on the listing. The API groups them; we do not. */
export type StoreShelf = {
  id: string;
  title: string;
  stores: readonly Vendor[];
};

/** The listing's banner — "Stock Up & Save up to 30% OFF". An offer is a
 *  claim about a discount, so it is data from `/offers/available`, never
 *  dictionary copy. Absent means no banner. */
export type Promotion = {
  id: string;
  title: string;
  body?: string;
  image?: string;
};

export type StoreListing = {
  shelves: readonly StoreShelf[];
  promotion?: Promotion;
  /** "120+" — as the API phrases it. */
  countLabel?: string;
};

/**
 * The grocery catalogue, implemented in `services/catalog/groceries.ts`
 * (Phase 16). A store is a vendor of business type `STORE`.
 */
export type GroceryCatalog = {
  /** `/vendors/nearby/open?businessType=STORE`. The API does not group stores
   *  or filter them by product category, so there is one shelf. */
  listStores(input: {
    location: ListingLocation;
    /** A name to match — the API's `searchTerm` (Phase 20c). */
    term?: string;
  }): Promise<StoreListing>;
  /** `/vendors/nearby/open/:userId` with its products, grouped into aisles. */
  getStore(storeId: string): Promise<GroceryStore>;
};
