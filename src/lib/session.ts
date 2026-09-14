/**
 * The session's rules, as pure functions (Phase 15).
 *
 * Cookie names are the old app's, unchanged. What changed is who writes them:
 * a route handler, so the refresh token can be `httpOnly` — script on the page
 * never needs it, because refreshing happens on the server.
 */

export const ACCESS_TOKEN_COOKIE = "deligo-access-token";
export const REFRESH_TOKEN_COOKIE = "deligo-refresh-token";
/** The name `/auth/refresh-token` reads the refresh token from (`cookies.refreshToken`). */
export const API_REFRESH_COOKIE = "refreshToken";
export const DEVICE_ID_STORAGE_KEY = "deligo-device-id";

/** A JWT's `exp`, in seconds, or `null` for anything that is not one. */
export function jwtExpiry(token: string): number | null {
  const payload = token.split(".")[1];
  if (!payload) return null;
  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = JSON.parse(
      atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=")),
    );
    return typeof json.exp === "number" ? json.exp : null;
  } catch {
    return null;
  }
}

export type SessionTokens = { accessToken: string; refreshToken?: string };

export type CookieWrite = {
  name: string;
  value: string;
  options: {
    path: "/";
    sameSite: "lax";
    secure: boolean;
    httpOnly: boolean;
    expires?: Date;
  };
};

/**
 * The cookies a session is stored in. The access token is readable by the page
 * (the browser client sends it as `Authorization`); the refresh token is not.
 * Each expires when its JWT does, so a present cookie is a live-looking token.
 */
export function sessionCookies(tokens: SessionTokens, secure: boolean): CookieWrite[] {
  const write = (name: string, value: string, httpOnly: boolean): CookieWrite => {
    const exp = jwtExpiry(value);
    return {
      name,
      value,
      options: {
        path: "/",
        sameSite: "lax",
        secure,
        httpOnly,
        ...(exp ? { expires: new Date(exp * 1000) } : {}),
      },
    };
  };
  const out = [write(ACCESS_TOKEN_COOKIE, tokens.accessToken, false)];
  if (tokens.refreshToken)
    out.push(write(REFRESH_TOKEN_COOKIE, tokens.refreshToken, true));
  return out;
}

/** Tokens as the API hands them over, or `null` if the shape is not that. */
export function readTokens(data: unknown): SessionTokens | null {
  if (!data || typeof data !== "object") return null;
  const { accessToken, refreshToken } = data as Record<string, unknown>;
  if (typeof accessToken !== "string" || jwtExpiry(accessToken) === null) return null;
  return typeof refreshToken === "string" && jwtExpiry(refreshToken) !== null
    ? { accessToken, refreshToken }
    : { accessToken };
}

/**
 * The 401s that end a session, measured against the live API:
 * no header → `AUTHENTICATION_REQUIRED`; malformed or expired → `NOT_AUTHORIZED`.
 * A wrong OTP is also a 401 (`INVALID_OTP_CODE`) and must not sign anyone out,
 * which is why this reads the key and not the status alone. A 401 with no key
 * is treated as ended — stranding someone in a session that silently fails is
 * the worse mistake.
 */
const SESSION_ENDED_KEYS = new Set(["AUTHENTICATION_REQUIRED", "NOT_AUTHORIZED"]);

export function isSessionEnded(status: number | undefined, errorKey?: string): boolean {
  if (status !== 401) return false;
  return !errorKey || SESSION_ENDED_KEYS.has(errorKey);
}

/** Where to go after signing in: a path on this site, or nowhere. `//evil.com`
 *  and `https://…` are an open redirect, not a destination. */
export function safeNextPath(value: string | null | undefined): string | null {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return null;
  }
  return value;
}

/**
 * Whether a request to our own session endpoints came from our own pages.
 * Without it any site could post an attacker's tokens here and sign a visitor
 * into the attacker's account (login CSRF).
 */
export function isSameOrigin(
  origin: string | null,
  fetchSite: string | null,
  selfOrigin: string,
): boolean {
  if (origin) return origin === selfOrigin;
  return fetchSite === "same-origin";
}
