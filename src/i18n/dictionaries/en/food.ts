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
  locationNotFound: "We couldn’t find that address. Try adding the city or postcode.",
  locationDenied: "Location access is off for this site. Type your address instead.",
  locationUnavailable: "We couldn’t get a location right now. Try typing your address.",
  locationPosition:
    "Your device couldn’t tell where you are. Check that location services are on for your browser, or type your address.",
  currentLocation: "Current location",
  seeRestaurants: "See Restaurant",
  trustedBy: "Trusted by millions globally",

  // ── The listing ──────────────────────────────────────────────────────────

  deliveringTo: "Delivering to",
  changeAddress: "Change",
  setAddress: "Set a delivery address",
  restaurantsAvailable: "restaurants available at your location",
  favouriteCuisines: "Favorite Cuisines",
  allRestaurants: "All Restaurant",
  vendorImage: "Restaurant photograph",
  rating: "Rating",

  noRestaurants: "No restaurants match these filters",
  noRestaurantsBody:
    "No restaurant near this address serves that cuisine. Clear it to see them all.",

  // The catalogue is not connected yet — a different sentence from "no
  // matches", because it has a different fix and neither is the customer's.
  catalogueUnavailable: "Restaurants are unavailable right now",
  catalogueUnavailableBody:
    "We couldn’t reach the restaurant list just now. Try again in a moment.",

  // ── A vendor's page ──────────────────────────────────────────────────────
  openUntil: "Open · Closes at {time}",
  closedOpensAt: "Closed · Opens at {time}",
  percentOff: "{value}% OFF",
  amountOff: "{value} OFF",
  reviewsCount_one: "({count} review)",
  reviewsCount_other: "({count} reviews)",
  clearCuisine: "Show all cuisines",
  noLocationTitle: "Where should we deliver?",
  noLocationBody:
    "Set your address or use your current location, and we’ll show the restaurants that deliver there.",
  searchHeading: "Search",
  searchTitle: "Results for “{query}”",
  searchCount_one: "{count} dish",
  searchCount_other: "{count} dishes",
  searchPrompt: "Type at least {min} letters in the search box to find a dish.",
  searchEmpty: "Nothing matches “{query}”",
  searchEmptyBody:
    "Try a shorter word, or the name of the dish instead of the restaurant.",
  searchUnavailable: "Search is unavailable right now",
  searchUnavailableBody: "We couldn’t reach search just now. Try again in a moment.",
  outOfStock: "Out of stock",
  previousPage: "Previous",
  nextPage: "Next",
  reviews: "Reviews",
  availableDeals: "Available Deals",
  availableDealsBody: "Save more on your favorite items",
  searchItems: "Search this menu",
  searchItemsPlaceholder: "Search items...",
  menuNavigation: "Menu categories",
  noItems: "No items match that search",
  noItemsBody: "Try a shorter word, or clear the search to see the whole menu.",
  noMenu: "This restaurant hasn’t added its menu yet",
  noMenuBody: "Check back soon, or pick another restaurant nearby.",
  otherCategory: "Other",
  signInToAdd: "Sign in to add dishes to your cart.",
  signInAction: "Sign in",
  offlineAdd: "This is the design preview — nothing is added from here.",
  yourCart: "Your cart",
  cartEmpty: "Your cart is empty",
  addToCart: "Add to cart",
  // ── The dish modal ───────────────────────────────────────────────────────
  optionRequired: "REQUIRED",
  chooseRequiredOptions: "Choose an option in each required group to continue.",
  specialInstructionsPlaceholder:
    "Any allergies or special requests? Let us know here...",
  quantity: "Quantity",
  increaseQuantity: "Increase quantity",
  decreaseQuantity: "Decrease quantity",
  closeProduct: "Close",
  // The cart endpoint is Phase 17's. Saying so beats a button that appears to
  // work and silently does nothing.

  vendorUnavailable: "This restaurant is unavailable right now",
  vendorUnavailableBody:
    "We couldn’t load this restaurant just now. Try again in a moment.",
} satisfies Record<string, string>;

export default food;
