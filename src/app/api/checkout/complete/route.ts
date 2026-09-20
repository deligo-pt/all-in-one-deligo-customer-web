import { NextResponse, type NextRequest } from "next/server";
import {
  PENDING_CHECKOUT_COOKIE,
  isCheckoutId,
  parsePendingCheckout,
} from "@/lib/checkout";
import { isSameOrigin } from "@/lib/session";
import { isApiError } from "@/services/api/error";
import { requestApi } from "@/services/api/request";

/**
 * Creates the order after REDUNIQ (Phase 18) — `POST /orders/create-order`.
 *
 * The checkout is the one named by the return URL when it names one, else the
 * one remembered before the redirect. The gateway token is read from the
 * summary itself (`gatewayPaymentToken`), so nothing the browser kept is
 * trusted with it. A summary already converted answers with its order, which
 * makes a reload or a second tab harmless. Until the payment is captured the
 * API refuses (`PAYMENT_FAILED_TRY_AGAIN`), and that sentence is passed on.
 */
export async function POST(request: NextRequest) {
  if (
    !isSameOrigin(
      request.headers.get("origin"),
      request.headers.get("sec-fetch-site"),
      request.nextUrl.origin,
    )
  ) {
    return new NextResponse(null, { status: 403 });
  }

  const pending = parsePendingCheckout(
    request.cookies.get(PENDING_CHECKOUT_COOKIE)?.value,
  );
  const body = (await request.json().catch(() => ({}))) as { id?: unknown };
  const id = isCheckoutId(body.id) ? body.id : pending?.id;
  if (!id) return NextResponse.json({}, { status: 404 });

  const done = (orderId: string) => {
    const response = NextResponse.json({ orderId });
    response.cookies.delete(PENDING_CHECKOUT_COOKIE);
    return response;
  };

  try {
    const api = requestApi(request);
    const { data } = await api.get(`/checkout/summary/${id}`);
    const summary = data?.data ?? {};
    if (summary.isConvertedToOrder && typeof summary.orderId === "string")
      return done(summary.orderId);
    if (typeof summary.gatewayPaymentToken !== "string")
      return NextResponse.json({}, { status: 409 });

    const created = await api.post("/orders/create-order", {
      checkoutSummaryId: id,
      paymentToken: summary.gatewayPaymentToken,
      deliveryNotes: pending?.id === id ? pending.notes : "",
    });
    const orderId: unknown = created.data?.data?.orderId;
    if (typeof orderId !== "string") return NextResponse.json({}, { status: 502 });
    return done(orderId);
  } catch (error) {
    return NextResponse.json(
      { message: isApiError(error) ? error.message : undefined },
      { status: isApiError(error) && error.status === 401 ? 401 : 400 },
    );
  }
}
