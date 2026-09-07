/**
 * The two locales, and everything derivable from them, in one place.
 *
 * This module is the single source of truth for "which languages does this app
 * have". `verify:i18n` asserts that no other file writes the list out again —
 * the previous project had `"en" | "pt"` typed by hand in eleven files, and
 * adding a third language meant finding all eleven.
 *
 * It is deliberately dependency-free: the proxy (edge runtime), server
 * components, client components and the verification scripts all import it.
 */

/** Ordered by preference when nothing else decides. */
export const LOCALES = ["pt", "en"] as const;

export type Locale = (typeof LOCALES)[number];

/**
 * Portuguese, not English.
 *
 * DeliGo is a Portuguese product; the previous app defaulted its store to `pt`
 * and then shipped `<html lang="en">` for its whole life. The default belongs
 * here, once, so that the proxy, the metadata and the fallback dictionary
 * cannot disagree about it.
 */
export const DEFAULT_LOCALE: Locale = "pt";

export function isLocale(value: string | undefined | null): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/**
 * BCP-47 tags for `Intl`.
 *
 * `en-GB` rather than `en-US`: the audience is in Portugal, and `en-US` would
 * render 15/08/2026 as 8/15/2026 and €12.50 with US grouping. The English here
 * is the English of a European customer, not an American one.
 *
 * Consequence worth knowing before Phase 5 renders a price: `pt-PT` formats
 * EUR as `12,50 €` and `en-GB` as `€12.50`. Both are correct for their reader,
 * and they do not look alike. The old app hard-coded `€` + `toFixed(2)` for
 * both languages, which is wrong for the majority of its users.
 */
export const BCP47: Record<Locale, string> = {
  pt: "pt-PT",
  en: "en-GB",
};

/**
 * Times are rendered in Portugal's timezone, not the machine's.
 *
 * Without this, `Intl.DateTimeFormat` uses the ambient zone: the build server's
 * during prerender and the visitor's in the browser. Those differ, so the same
 * order time renders two ways on the same page — a hydration mismatch that
 * shows up as a flicker and, on a delivery ETA, as a wrong number. The backend
 * sends UTC; the customer is in Portugal; the conversion belongs here.
 *
 * When the product serves a second country this becomes a per-customer value
 * rather than a constant. It is a constant now because it is true now.
 */
export const DEFAULT_TIME_ZONE = "Europe/Lisbon";

/** The platform is euro-only. Backend responses still carry a currency code;
 *  this is the fallback when one is absent, not a replacement for it. */
export const DEFAULT_CURRENCY = "EUR";

/** The cookie the proxy writes and reads to remember a deliberate choice.
 *  `NEXT_LOCALE` is Next's own convention; keeping the name means the value
 *  survives if this ever moves to a framework-level i18n implementation. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

/** One year. A language preference is not a session. */
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
