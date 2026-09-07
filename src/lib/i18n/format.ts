/**
 * Locale-aware number, money and date formatting.
 *
 * Every one of these takes a `Locale` and maps it through `BCP47` here, so that
 * no call site anywhere in the app ever writes a language tag. `verify:i18n`
 * asserts that: an `Intl` constructor given a string literal outside this
 * directory is a failure, because that is exactly how the previous project
 * ended up formatting Portuguese dates as `en-GB` in three places.
 *
 * A note that matters more than it looks: these functions format numbers for
 * display. They never *derive* one. Backend money, discounts and ratings are
 * rendered exactly as the API returns them — no rounding into a total, no
 * recomputing a percentage from a delta. Passing an API value through
 * `formatCurrency` is display; adding two API values together is a bug.
 */
import { BCP47, DEFAULT_CURRENCY, DEFAULT_TIME_ZONE, type Locale } from "./locale";

/** Constructing an `Intl` formatter is measurably expensive and the set of
 *  distinct arguments in an app this size is small. Keyed on the full options
 *  so two callers asking for different shapes cannot collide. */
const cache = new Map<string, Intl.NumberFormat | Intl.DateTimeFormat>();

function numberFormat(locale: Locale, options: Intl.NumberFormatOptions) {
  const key = `n:${locale}:${JSON.stringify(options)}`;
  const hit = cache.get(key);
  if (hit) return hit as Intl.NumberFormat;
  const made = new Intl.NumberFormat(BCP47[locale], options);
  cache.set(key, made);
  return made;
}

function dateTimeFormat(locale: Locale, options: Intl.DateTimeFormatOptions) {
  // The timezone is pinned unless a caller overrides it, so that a date
  // formatted on the server and the same date formatted in the browser agree.
  const withZone = { timeZone: DEFAULT_TIME_ZONE, ...options };
  const key = `d:${locale}:${JSON.stringify(withZone)}`;
  const hit = cache.get(key);
  if (hit) return hit as Intl.DateTimeFormat;
  const made = new Intl.DateTimeFormat(BCP47[locale], withZone);
  cache.set(key, made);
  return made;
}

/**
 * A price.
 *
 * `pt-PT` renders `12,50 €`; `en-GB` renders `€12.50`. They are both right and
 * they do not look alike — a Figma screen drawn in English shows the second and
 * a Portuguese customer must still see the first.
 *
 * `currency` comes from the API when the API sends one. It is a parameter
 * rather than a constant because the response carries it, not because the
 * platform has more than one.
 */
export function formatCurrency(
  amount: number,
  locale: Locale,
  currency: string = DEFAULT_CURRENCY,
): string {
  return numberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

/** A plain number — quantities, counts, distances. */
export function formatNumber(
  value: number,
  locale: Locale,
  options: Intl.NumberFormatOptions = {},
): string {
  return numberFormat(locale, options).format(value);
}

/** A ratio the backend expresses as a fraction (`0.15` → `15%`). Not for a
 *  backend value that is already a percentage — that is a number, not a rate. */
export function formatPercent(
  rate: number,
  locale: Locale,
  options: Intl.NumberFormatOptions = {},
): string {
  return numberFormat(locale, { style: "percent", ...options }).format(rate);
}

/**
 * Anything the API might hand us as a moment in time, narrowed to a `Date`.
 * An unparseable value yields `null` so callers render nothing rather than the
 * string "Invalid Date", which is what the previous app printed on an order
 * whose `createdAt` was absent.
 */
function toDate(value: Date | string | number | null | undefined): Date | null {
  if (value === null || value === undefined) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** `15/08/2026` in both locales — day first, which `en-GB` and `pt-PT` agree on. */
export function formatDate(
  value: Date | string | number | null | undefined,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  },
): string {
  const date = toDate(value);
  return date ? dateTimeFormat(locale, options).format(date) : "";
}

/** `14:30`. 24-hour in both locales, which is what both readers expect. */
export function formatTime(
  value: Date | string | number | null | undefined,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  },
): string {
  const date = toDate(value);
  return date ? dateTimeFormat(locale, options).format(date) : "";
}

/** Date and time together, for order timelines and support threads. */
export function formatDateTime(
  value: Date | string | number | null | undefined,
  locale: Locale,
): string {
  const date = toDate(value);
  if (!date) return "";
  return dateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

/**
 * A country, in the reader's language: `"FR"` becomes "France" or "França".
 *
 * `Intl.DisplayNames` knows every region name in both languages, so a list of
 * countries needs ISO codes rather than two dictionary entries each — and it
 * gets the ones nobody would think to check right as well.
 */
export function formatRegion(code: string, locale: Locale): string {
  return new Intl.DisplayNames(BCP47[locale], { type: "region" }).of(code) ?? code;
}

/** A joined list — "A, B and C" / "A, B e C" — without hand-written separators. */
export function formatList(items: readonly string[], locale: Locale): string {
  return new Intl.ListFormat(BCP47[locale], {
    style: "long",
    type: "conjunction",
  }).format(items);
}
