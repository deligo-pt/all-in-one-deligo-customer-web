/**
 * The grocery vertical's public surface: two views and the catalogue seam.
 * The cards and the cart panel are internals; the store-page chrome they sit
 * in is the food vertical's, reused through its barrel.
 */
export { GroceryListing, type GroceryListingCopy } from "./GroceryListing";
export { StoreView, type StoreViewCopy } from "./StoreView";
export type {
  Aisle,
  GroceryCatalog,
  GroceryProduct,
  GroceryStore,
  Promotion,
  StoreListing,
  StoreShelf,
} from "./types";
