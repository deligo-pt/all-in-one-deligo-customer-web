/**
 * The routes that are development tools, not pages.
 *
 * `/tokens` renders the design system, `/primitives` the component gallery,
 * `/formats` the locale-aware formatters, `/auth-states` every state of the
 * sign-in panel and `/food-states` the food screens against the design's own
 * sample content. Each calls `notFound()` when `NODE_ENV === "production"`, so
 * no customer can reach one.
 *
 * Shared by two guards that would otherwise each keep their own copy and
 * eventually disagree: `verify:shell` asserts every name here really does 404
 * in production, and `verify:bundle` excludes them from the first-load budget
 * *because* of that assertion. The exclusion is only honest while the other
 * guard holds, which is why they read the same list.
 */
export const DEV_ONLY_ROUTES = [
  "tokens",
  "primitives",
  "formats",
  "auth-states",
  "food-states",
];
