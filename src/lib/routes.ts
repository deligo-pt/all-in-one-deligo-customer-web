/**
 * Every page this application will have, in one place.
 *
 * Written in Phase 4 rather than grown page by page, because the header and the
 * footer link to most of it and a link whose target does not exist is a 404 that
 * only shows up when somebody clicks it. `verify:shell` checks both directions:
 * every route here has a page file, and every page file is named here.
 *
 * `phase` records which phase replaces the placeholder with the real screen. It
 * is not decoration — it is what tells a reader whether a bare page is unfinished
 * work or a mistake.
 *
 * `flagged` marks the verticals with no backend behind them (Plan.md §2.3,
 * decision D-6). They are built and reachable, but hidden from navigation in
 * production so that nobody clicks into a vertical that cannot answer.
 *
 * Paths carry no locale. `withLocale` adds it; that is the only place the
 * `/pt` prefix is constructed.
 */
export type RouteGroup =
  "marketing" | "shop" | "services" | "account" | "checkout" | "auth";

export type Route = {
  /** Locale-less path, always rooted. */
  path: string;
  /** App Router folder group — affects the file's location, never the URL. */
  group: RouteGroup;
  /** The phase that builds the real screen. */
  phase: number;
  /** A vertical with no backend evidence yet (D-6). */
  flagged?: true;
  /** A dynamic segment needs a sample value to be reachable in the route map. */
  dynamic?: true;
};

export const ROUTES = {
  home: { path: "/", group: "marketing", phase: 5 },
  services: { path: "/services", group: "marketing", phase: 5 },
  about: { path: "/about", group: "marketing", phase: 12 },
  partner: { path: "/partner", group: "marketing", phase: 5 },
  plus: { path: "/plus", group: "marketing", phase: 5 },
  ourStory: { path: "/our-story", group: "marketing", phase: 12 },
  careers: { path: "/careers", group: "marketing", phase: 12 },
  blog: { path: "/blog", group: "marketing", phase: 12 },
  press: { path: "/press", group: "marketing", phase: 12 },
  contact: { path: "/contact", group: "marketing", phase: 12 },
  privacy: { path: "/privacy", group: "marketing", phase: 12 },
  terms: { path: "/terms", group: "marketing", phase: 12 },
  help: { path: "/help", group: "marketing", phase: 12 },
  helpDelivery: { path: "/help/delivery", group: "marketing", phase: 12 },
  helpReturns: { path: "/help/returns", group: "marketing", phase: 12 },
  trackOrder: { path: "/help/track-order", group: "marketing", phase: 11 },
  faqs: { path: "/faqs", group: "marketing", phase: 12 },

  food: { path: "/food", group: "shop", phase: 7 },
  // The listing is its own page, not the landing scrolled: the design draws
  // them as two frames with different headers, and "See Restaurant" on the
  // landing is a navigation rather than an anchor.
  restaurants: { path: "/food/restaurants", group: "shop", phase: 7 },
  groceries: { path: "/groceries", group: "shop", phase: 13 },
  electronics: { path: "/electronics", group: "shop", phase: 13 },
  search: { path: "/search", group: "shop", phase: 16 },
  vendor: { path: "/vendors/[vendorId]", group: "shop", phase: 7, dynamic: true },
  product: { path: "/products/[productId]", group: "shop", phase: 8, dynamic: true },

  ride: { path: "/ride", group: "services", phase: 14, flagged: true },
  hotel: { path: "/hotel", group: "services", phase: 14, flagged: true },
  parcel: { path: "/parcel", group: "services", phase: 14, flagged: true },

  // Sign-in is a route as well as a drawer. The drawer is the design's normal
  // path and keeps the customer where they were; this is what a bookmark, a
  // shared link, an expired session and a browser with no JavaScript all land
  // on. Both render the same panel — see `src/features/auth`.
  login: { path: "/login", group: "auth", phase: 6 },

  cart: { path: "/cart", group: "checkout", phase: 9 },
  checkout: { path: "/checkout", group: "checkout", phase: 10 },

  account: { path: "/account", group: "account", phase: 12 },
  orders: { path: "/account/orders", group: "account", phase: 11 },
  order: {
    path: "/account/orders/[orderId]",
    group: "account",
    phase: 11,
    dynamic: true,
  },
  addresses: { path: "/account/addresses", group: "account", phase: 12 },
  paymentMethods: { path: "/account/payment-methods", group: "account", phase: 12 },
  vouchers: { path: "/account/vouchers", group: "account", phase: 12 },
  referrals: { path: "/account/referrals", group: "account", phase: 12 },
  settings: { path: "/account/settings", group: "account", phase: 12 },
  notifications: { path: "/notifications", group: "account", phase: 11 },
} as const satisfies Record<string, Route>;

export type RouteName = keyof typeof ROUTES;

/** The verticals that DeliGo's marketing describes and its API does not
 *  answer for. Kept as a list rather than derived, so that removing the flag
 *  from one of them is a deliberate edit. */
export const FLAGGED_ROUTES = Object.entries(ROUTES)
  .filter(([, route]) => "flagged" in route)
  .map(([name]) => name as RouteName);
