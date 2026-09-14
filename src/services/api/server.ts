import type { AxiosInstance } from "axios";
import { cookies } from "next/headers";
import { getLocale } from "@/i18n/server";
import { ACCESS_TOKEN_COOKIE } from "@/lib/session";
import { createApiClient } from "./client";

/**
 * The API client for Server Components (Phase 16). The token is the request's
 * cookie — the proxy has already refreshed it before this runs — and the
 * language is the page's. No refresh hook: a server render that finds the
 * session dead renders signed out, and the next navigation is redirected.
 */
export async function serverApi(): Promise<AxiosInstance> {
  const [jar, locale] = await Promise.all([cookies(), getLocale()]);
  const token = jar.get(ACCESS_TOKEN_COOKIE)?.value;
  return createApiClient({ getAccessToken: () => token, getLocale: () => locale });
}

export async function hasServerSession(): Promise<boolean> {
  return Boolean((await cookies()).get(ACCESS_TOKEN_COOKIE)?.value);
}
