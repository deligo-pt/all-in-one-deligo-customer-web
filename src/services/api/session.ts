import axios from "axios";
import { API_REFRESH_COOKIE, readTokens, type SessionTokens } from "@/lib/session";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * `POST /auth/refresh-token`, from the server.
 *
 * The endpoint reads the refresh token from a cookie named `refreshToken`
 * (measured: `path: ["cookies", "refreshToken"]`), which a browser cannot send
 * to another origin on our behalf — so refreshing happens in the proxy and in
 * `/api/session/refresh`, never in page script.
 *
 * **The success body is not yet observed.** It is read as `data.accessToken`
 * with an optional rotated `data.refreshToken` (the login envelope), falling
 * back to a rotated `refreshToken` cookie. Anything else counts as a failed
 * refresh and ends the session, which is the safe way to be wrong.
 */
export async function refreshTokens(
  refreshToken: string,
): Promise<SessionTokens | null> {
  if (!BASE_URL) return null;
  try {
    const response = await axios.post(`${BASE_URL}/auth/refresh-token`, null, {
      headers: { Cookie: `${API_REFRESH_COOKIE}=${refreshToken}` },
      timeout: 10_000,
    });
    const tokens = readTokens((response.data as { data?: unknown })?.data);
    if (!tokens) return null;
    if (tokens.refreshToken) return tokens;
    const rotated = ([] as string[])
      .concat(response.headers["set-cookie"] ?? [])
      .map((c) => c.match(new RegExp(`^${API_REFRESH_COOKIE}=([^;]+)`))?.[1])
      .find(Boolean);
    const decoded = rotated ? decodeURIComponent(rotated) : undefined;
    return { accessToken: tokens.accessToken, refreshToken: decoded ?? refreshToken };
  } catch {
    return null;
  }
}
