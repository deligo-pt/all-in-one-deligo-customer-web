/**
 * The food vertical's public surface.
 *
 * Two composed views and the catalogue contract. The cards, the rail, the
 * menu bar and the cart panel are internals — `verify:structure` forbids
 * reaching past this file, and the reason is that a second, slightly different
 * restaurant card appearing on some other screen is exactly how the previous
 * app ended up with seven pinks.
 *
 * **Import this barrel statically only where the screens are wanted, and keep
 * heavy leaves off it entirely.** A static import hands the importer every
 * export, and this has now been measured three times: 27 KB and then 9.3 KB in
 * Phase 6, and 11 KB here, when `ProductModal` was briefly exported as a value
 * and `/food/restaurants` — a route with no dish modal on it — started
 * shipping a Radix dialog. It is reached only through `VendorMenu`'s
 * `dynamic()` call; the barrel exports its **copy type** and nothing else,
 * because a type is erased and costs no bytes.
 */
export { VendorListing, type ListingCopy } from "./VendorListing";
export { VendorMenu, type MenuCopy } from "./VendorMenu";
// The store-page parts groceries reuse (Phase 13). Each is already in the
// graph of a food route, so exporting it adds nothing to one — and every one
// is rendered by a grocery route.
export { DeliveryBar } from "./DeliveryBar";
export { MenuNav } from "./MenuNav";
export { VendorCard } from "./VendorCard";
export { VendorIntro } from "./VendorIntro";
export type { ProductChoice, ProductCopy } from "./ProductModal";
export type {
  Cuisine,
  Deal,
  FoodCatalog,
  MenuCategory,
  MenuItem,
  OptionChoice,
  OptionGroup,
  ProductDetail,
  StoreDetails,
  Vendor,
  VendorDetail,
  VendorPage,
  ListingLocation,
  VendorStatus,
} from "./types";
