import { NextResponse, type NextRequest } from "next/server";
import { LOCATION_COOKIE, parseLocation } from "@/lib/location";
import { isSameOrigin } from "@/lib/session";

/** Stores the guest's chosen location for a year. Same-origin only, like the
 *  session: another site should not decide which restaurants a visitor sees. */
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
  const location = parseLocation(await request.json().catch(() => null));
  if (!location) return new NextResponse(null, { status: 400 });
  const response = new NextResponse(null, { status: 204 });
  response.cookies.set(LOCATION_COOKIE, JSON.stringify(location), {
    path: "/",
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}
