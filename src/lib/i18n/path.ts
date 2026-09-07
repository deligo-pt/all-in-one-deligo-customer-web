/**
 * The locale segment of a URL path.
 *
 * The locale lives in the URL (Plan.md §5 rule 4, decision D-2), which means
 * three places have to agree on how to read and write it: the proxy that
 * redirects an unprefixed request, the locale switcher that rewrites the
 * current path, and any link that has to point at a specific language. They
 * agree by all calling these two functions.
 */
import { isLocale, type Locale } from "./locale";

/**
 * Splits `/pt/cart` into `{ locale: "pt", rest: "/cart" }`.
 *
 * `rest` is always rooted and never empty, so it can be concatenated without a
 * caller checking for a double slash: `/pt` gives `{ locale: "pt", rest: "/" }`.
 * A path with no locale prefix gives `locale: null` and the path unchanged.
 */
export function splitLocale(pathname: string): {
  locale: Locale | null;
  rest: string;
} {
  const [, first = "", ...others] = pathname.split("/");
  if (!isLocale(first)) return { locale: null, rest: pathname || "/" };
  const rest = `/${others.join("/")}`;
  return { locale: first, rest: rest === "/" ? "/" : rest.replace(/\/$/, "") };
}

/**
 * The same page in another language: `withLocale("/pt/cart", "en")` → `/en/cart`.
 *
 * Written to be correct for a path that has no prefix yet, which is the case
 * the proxy needs — `withLocale("/cart", "pt")` → `/pt/cart`.
 */
export function withLocale(pathname: string, locale: Locale): string {
  const { rest } = splitLocale(pathname);
  return rest === "/" ? `/${locale}` : `/${locale}${rest}`;
}
