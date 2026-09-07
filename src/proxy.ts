/**
 * Putting a locale on every request.
 *
 * Renamed from `middleware.ts` in Next 16 — same behaviour, and the file must
 * sit beside `app/`, which here means inside `src/`.
 *
 * Two jobs, both about the URL:
 *
 *  1. A request with no locale prefix is redirected to one. Which one is the
 *    customer's last explicit choice, then what their browser asks for, then
 *    Portuguese — decided in `resolveRequestLocale`, not here.
 *  2. A request that already names a locale has that choice recorded, so
 *     following a shared `/en/...` link makes English stick for the next visit.
 *     This is the only place the cookie is written; the switcher just navigates.
 */
import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE } from "@/lib/i18n/locale";
import { resolveRequestLocale } from "@/lib/i18n/negotiate";
import { splitLocale, withLocale } from "@/lib/i18n/path";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { locale } = splitLocale(pathname);

  if (locale) {
    const response = NextResponse.next();
    if (request.cookies.get(LOCALE_COOKIE)?.value !== locale) {
      response.cookies.set(LOCALE_COOKIE, locale, {
        path: "/",
        maxAge: LOCALE_COOKIE_MAX_AGE,
        sameSite: "lax",
      });
    }
    return response;
  }

  const target = resolveRequestLocale(
    request.cookies.get(LOCALE_COOKIE)?.value,
    request.headers.get("accept-language"),
  );

  const url = request.nextUrl.clone();
  url.pathname = withLocale(pathname, target);
  // 307: the method and body survive, and browsers do not cache the choice —
  // a permanent redirect here would pin the first visitor's language into the
  // browser cache for everyone sharing that machine.
  return NextResponse.redirect(url, 307);
}

export const config = {
  // Everything except Next's own assets, API routes, and any path that looks
  // like a file (`/favicon.ico`, `/robots.txt`, `/images/hero.webp`). Those
  // must not be rewritten under a language.
  matcher: ["/((?!_next|api|.*\\.).*)"],
};
