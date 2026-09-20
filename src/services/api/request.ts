import type { AxiosInstance } from "axios";
import type { NextRequest } from "next/server";
import { LOCALE_COOKIE, isLocale } from "@/lib/i18n/locale";
import { ACCESS_TOKEN_COOKIE } from "@/lib/session";
import { createApiClient } from "./client";

/**
 * The API client for a route handler (Phase 18): the token and the language
 * come from the request's cookies, since a handler under `/api` has no locale
 * segment to read. No refresh — the proxy refreshes before pages, and a handler
 * called with a dead session answers 401 for the page to act on.
 */
export function requestApi(request: NextRequest): AxiosInstance {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const locale = request.cookies.get(LOCALE_COOKIE)?.value;
  return createApiClient({
    getAccessToken: () => token,
    getLocale: () => (isLocale(locale) ? locale : "pt"),
  });
}
