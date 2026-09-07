/**
 * Picking a locale for a request that did not name one.
 *
 * Deliberately hand-written rather than pulling in `negotiator` +
 * `@formatjs/intl-localematcher`, which is what the Next.js guide reaches for.
 * Those two exist to match a long tail of tagged, weighted, region-qualified
 * languages against a large locale set. This app has two locales and no regional
 * variants; the whole problem is "does the header prefer `pt` or `en`".
 *
 * The rule, in order: an explicit choice the customer already made, then what
 * their browser asks for, then Portuguese.
 */
import { DEFAULT_LOCALE, isLocale, type Locale } from "./locale";

/**
 * The best supported locale for an `Accept-Language` header.
 *
 * Handles quality values (`pt-PT,pt;q=0.9,en;q=0.8`) and region subtags — `pt-BR`
 * is Portuguese and should get the Portuguese app, even though we do not ship a
 * Brazilian variant. Returns `null` when the header names nothing we have, so
 * the caller decides what "nothing matched" means.
 */
export function negotiateLocale(acceptLanguage: string | null): Locale | null {
  if (!acceptLanguage) return null;

  const ranked = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag = "", ...params] = part.trim().split(";");
      const q = params
        .map((p) => p.trim())
        .find((p) => p.startsWith("q="))
        ?.slice(2);
      const quality = q === undefined ? 1 : Number.parseFloat(q);
      return {
        language: tag.trim().toLowerCase().split("-")[0] ?? "",
        quality: Number.isFinite(quality) ? quality : 0,
      };
    })
    .filter((entry) => entry.quality > 0)
    .sort((a, b) => b.quality - a.quality);

  for (const { language } of ranked) {
    if (isLocale(language)) return language;
    // `*` means "anything"; honour it as the default rather than ignoring it.
    if (language === "*") return DEFAULT_LOCALE;
  }
  return null;
}

/**
 * The locale for a request, given the cookie the customer's last choice wrote
 * and the header their browser sent. Never returns null — something has to be
 * served.
 */
export function resolveRequestLocale(
  cookieValue: string | undefined,
  acceptLanguage: string | null,
): Locale {
  if (isLocale(cookieValue)) return cookieValue;
  return negotiateLocale(acceptLanguage) ?? DEFAULT_LOCALE;
}
