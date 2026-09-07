/**
 * The header, in both of its forms.
 *
 * The design has two navigation bars, not one: a marketing bar (Home ·
 * Services · About · Partner · DeliGo Plus) on the pages a visitor arrives at,
 * and an app bar listing the six verticals (Food · Groceries · Ride · Hotel
 * Booking · Parcel · Electronics) everywhere else. Both are 110px tall and
 * share the logo, search and right-hand actions.
 */
const nav = {
  skipToContent: "Skip to content",
  mainNavigation: "Main navigation",

  // Marketing bar
  home: "Home",
  services: "Services",
  about: "About",
  partner: "Partner",
  plus: "DeliGo Plus",

  // App bar — the six verticals
  food: "Food",
  groceries: "Groceries",
  ride: "Ride",
  hotel: "Hotel Booking",
  parcel: "Parcel",
  electronics: "Electronics",

  // Actions
  search: "Search",
  searchPlaceholder: "Search...",
  notifications: "Notifications",
  cart: "Cart",
  account: "Account",
  login: "Login",
  downloadApp: "Download App",
  openMenu: "Open menu",
  menu: "Menu",
} satisfies Record<string, string>;

export default nav;
