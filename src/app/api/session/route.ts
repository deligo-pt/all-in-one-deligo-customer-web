import { NextResponse, type NextRequest } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  isSameOrigin,
  readTokens,
  sessionCookies,
} from "@/lib/session";

function allowed(request: NextRequest): boolean {
  return isSameOrigin(
    request.headers.get("origin"),
    request.headers.get("sec-fetch-site"),
    request.nextUrl.origin,
  );
}

/** Stores the tokens a sign-in returned. Both are required. */
export async function POST(request: NextRequest) {
  if (!allowed(request)) return new NextResponse(null, { status: 403 });
  const tokens = readTokens(await request.json().catch(() => null));
  if (!tokens?.refreshToken) return new NextResponse(null, { status: 400 });

  const response = new NextResponse(null, { status: 204 });
  const secure = request.nextUrl.protocol === "https:";
  for (const c of sessionCookies(tokens, secure))
    response.cookies.set(c.name, c.value, c.options);
  return response;
}

/** Signs this browser out. */
export function DELETE(request: NextRequest) {
  if (!allowed(request)) return new NextResponse(null, { status: 403 });
  const response = new NextResponse(null, { status: 204 });
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  response.cookies.delete(REFRESH_TOKEN_COOKIE);
  return response;
}
