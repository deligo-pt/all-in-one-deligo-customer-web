/**
 * Putting a locale on every request.
 *
 * Renamed from `middleware.ts` in Next 16 — same behaviour, and the file must
 * sit beside `app/`, which here means inside `src/`.
 *
 * Three jobs:
 *
 *  1. A request with no locale prefix is redirected to one. Which one is the
 *    customer's last explicit choice, then what their browser asks for, then
 *    Portuguese — decided in `resolveRequestLocale`, not here.
 *  2. A request that already names a locale has that choice recorded, so
 *     following a shared `/en/...` link makes English stick for the next visit.
 *     This is the only place the cookie is written; the switcher just navigates.
 *  3. The session (Phase 15). An expired access cookie with a live refresh
 *     cookie is refreshed here, before the page renders, so no screen starts
 *     from a dead token. A signed-in route without a session goes to
 *     `/login?next=…`; `/login` with one goes where `next` says.
 */
import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE } from "@/lib/i18n/locale";
import { resolveRequestLocale } from "@/lib/i18n/negotiate";
import { splitLocale, withLocale } from "@/lib/i18n/path";
import { ROUTES, requiresSession } from "@/lib/routes";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  safeNextPath,
  sessionCookies,
  type CookieWrite,
} from "@/lib/session";
import { refreshTokens } from "@/services/api/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { locale, rest: path } = splitLocale(pathname);

  if (locale) {
    let writes: CookieWrite[] = [];
    let ended = false;
    let signedIn = Boolean(request.cookies.get(ACCESS_TOKEN_COOKIE)?.value);
    const refresh = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
    if (!signedIn && refresh) {
      const tokens = await refreshTokens(refresh);
      if (tokens) {
        writes = sessionCookies(tokens, request.nextUrl.protocol === "https:");
        signedIn = true;
        // The page rendering this request must see the new token too.
        for (const c of writes) request.cookies.set(c.name, c.value);
      } else {
        ended = true;
      }
    }

    let response: NextResponse;
    if (!signedIn && requiresSession(path)) {
      const login = request.nextUrl.clone();
      login.pathname = withLocale(ROUTES.login.path, locale);
      login.search = `?next=${encodeURIComponent(`${pathname}${request.nextUrl.search}`)}`;
      response = NextResponse.redirect(login, 307);
    } else if (signedIn && path === ROUTES.login.path) {
      const next = safeNextPath(request.nextUrl.searchParams.get("next"));
      response = NextResponse.redirect(
        new URL(next ?? withLocale("/", locale), request.url),
        307,
      );
    } else {
      response = NextResponse.next({ request: { headers: request.headers } });
    }

    for (const c of writes) response.cookies.set(c.name, c.value, c.options);
    if (ended) response.cookies.delete(REFRESH_TOKEN_COOKIE);
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
