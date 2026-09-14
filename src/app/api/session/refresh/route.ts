import { NextResponse, type NextRequest } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  isSameOrigin,
  sessionCookies,
} from "@/lib/session";
import { refreshTokens } from "@/services/api/session";

/** Trades the `httpOnly` refresh cookie for a new access token. A refresh that
 *  fails ends the session here, so the page is never left holding half of one. */
export async function POST(request: NextRequest) {
  const self = request.nextUrl.origin;
  if (
    !isSameOrigin(
      request.headers.get("origin"),
      request.headers.get("sec-fetch-site"),
      self,
    )
  ) {
    return new NextResponse(null, { status: 403 });
  }
  const refresh = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  const tokens = refresh ? await refreshTokens(refresh) : null;

  if (!tokens) {
    const ended = new NextResponse(null, { status: 401 });
    ended.cookies.delete(ACCESS_TOKEN_COOKIE);
    ended.cookies.delete(REFRESH_TOKEN_COOKIE);
    return ended;
  }
  const response = new NextResponse(null, { status: 204 });
  const secure = request.nextUrl.protocol === "https:";
  for (const c of sessionCookies(tokens, secure))
    response.cookies.set(c.name, c.value, c.options);
  return response;
}
