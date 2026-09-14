import { NextResponse, type NextRequest } from "next/server";
import {
  PENDING_CHECKOUT_COOKIE,
  PENDING_CHECKOUT_MAX_AGE,
  parsePendingCheckout,
} from "@/lib/checkout";
import { isSameOrigin } from "@/lib/session";
import { requestApi } from "@/services/api/request";

const fromSelf = (request: NextRequest) =>
  isSameOrigin(
    request.headers.get("origin"),
    request.headers.get("sec-fetch-site"),
    request.nextUrl.origin,
  );

/** Remembers the checkout being paid, before the customer leaves for REDUNIQ.
 *  httpOnly and same-origin only: another site must not choose which checkout
 *  this browser finishes. See `lib/checkout.ts`. */
export async function POST(request: NextRequest) {
  if (!fromSelf(request)) return new NextResponse(null, { status: 403 });
  const pending = parsePendingCheckout(await request.json().catch(() => null));
  if (!pending) return new NextResponse(null, { status: 400 });
  const response = new NextResponse(null, { status: 204 });
  response.cookies.set(PENDING_CHECKOUT_COOKIE, JSON.stringify(pending), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
    maxAge: PENDING_CHECKOUT_MAX_AGE,
  });
  return response;
}

/** The payment did not happen: reset the summary so it can be paid again
 *  (`handle-payment-failure`, as the old app's failure page did), then forget
 *  it. A summary already converted to an order is left alone. */
export async function DELETE(request: NextRequest) {
  if (!fromSelf(request)) return new NextResponse(null, { status: 403 });
  const pending = parsePendingCheckout(
    request.cookies.get(PENDING_CHECKOUT_COOKIE)?.value,
  );
  if (pending) {
    try {
      const api = requestApi(request);
      const { data } = await api.get(`/checkout/summary/${pending.id}`);
      if (!data?.data?.isConvertedToOrder)
        await api.post(`/payment/reduniq/handle-payment-failure/${pending.id}`);
    } catch {
      // Best effort: the customer is told the payment failed either way.
    }
  }
  const response = new NextResponse(null, { status: 204 });
  response.cookies.delete(PENDING_CHECKOUT_COOKIE);
  return response;
}
