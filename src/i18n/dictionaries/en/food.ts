/**
 * The food vertical's words: the landing hero, the restaurant listing and a
 * vendor's own page.
 *
 * Its own namespace, so the four routes that render food strings pay for them
 * and the other sixty-eight do not.
 *
 * Copy is transcribed from the three frames — `Food` (823px), `food Home`
 * (1,553px) and `food Home` (2,633px). Where a string names data rather than
 * chrome — a restaurant's name, a price, "120+" — it is **not** here: those
 * come from the API exactly as sent (Plan.md §2.2).
 */
const food = {
  // ── The landing hero ─────────────────────────────────────────────────────
  heroBadge: "New: Fresh flavors are here",
  // Two lines in the design, the second in brand pink. Split so the colour
  // change is markup rather than a hard line break inside one string, which a
  // translator cannot move.
  heroTitleLead: "Your Favorite Food,",
  heroTitleAccent: "Delivered Fresh.",
  heroBody:
    "From local favorites to global cuisines, discover delicious meals from the best restaurants near you—delivered fast, fresh, and right to your door.",
  addressPlaceholder: "Enter your address",
  addressLabel: "Delivery address",
  locateMe: "Locate me",
  seeRestaurants: "See Restaurant",
  trustedBy: "Trusted by millions globally",

  // ── The listing ──────────────────────────────────────────────────────────
  filtersTitle: "Filter",
  filtersReset: "Reset All",
  sortBy: "Sort by",
  sortRecommended: "Recommended",
  sortBestValue: "Best Value",
  sortPriceAsc: "Price: Low to High",
  sortPriceDesc: "Price: High to Low",
  delivery: "Delivery",
  deliveryInstant: "Instant",
  deliveryPickup: "Pickup",
  deals: "Deals",
  dietary: "Dietary",
  cuisine: "Cuisine",

  deliveringTo: "Delivering to",
  changeAddress: "Change",
  setAddress: "Set a delivery address",
  restaurantsAvailable: "restaurants available at your location",
  favouriteCuisines: "Favorite Cuisines",
  allRestaurants: "All Restaurant",
  vendorImage: "Restaurant photograph",
  rating: "Rating",

  noRestaurants: "No restaurants match these filters",
  noRestaurantsBody: "Try clearing a filter, or widening the delivery options.",

  // The catalogue is not connected yet — a different sentence from "no
  // matches", because it has a different fix and neither is the customer's.
  catalogueUnavailable: "Restaurants are not available yet",
  catalogueUnavailableBody:
    "This screen is built; the catalogue behind it is connected in a later phase. Nothing here is placeholder data — there is simply nothing to show until it is.",

  // ── A vendor's page ──────────────────────────────────────────────────────
  reviews: "Reviews",
  availableDeals: "Available Deals",
  availableDealsBody: "Save more on your favorite items",
  searchItems: "Search this menu",
  searchItemsPlaceholder: "Search items...",
  menuNavigation: "Menu categories",
  noItems: "No items match that search",
  noItemsBody: "Try a shorter word, or clear the search to see the whole menu.",
  yourCart: "Your cart",
  cartEmpty: "Your cart is empty",
  addToCart: "Add to cart",
  // ── The dish modal ───────────────────────────────────────────────────────
  optionRequired: "REQUIRED",
  chooseRequiredOptions: "Choose an option in each required group to continue.",
  specialInstructions: "Special Instructions",
  specialInstructionsPlaceholder:
    "Any allergies or special requests? Let us know here...",
  quantity: "Quantity",
  increaseQuantity: "Increase quantity",
  decreaseQuantity: "Decrease quantity",
  closeProduct: "Close",
  // The cart endpoint is Phase 17's. Saying so beats a button that appears to
  // work and silently does nothing.
  cartNotWired:
    "The cart is not connected yet. Everything you have chosen here is real; the request that would send it arrives in a later phase.",

  vendorUnavailable: "This restaurant is not available yet",
  vendorUnavailableBody:
    "The page is built; the menu behind it arrives with the catalogue in a later phase.",
} satisfies Record<string, string>;

export default food;
