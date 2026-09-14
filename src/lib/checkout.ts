/**
 * The checkout rules that need no request and no framework (Phase 18).
 *
 * **A payment that leaves the site has to be finished by this site.** The
 * card, MB WAY and wallet flows all hand the customer to REDUNIQ's page, and
 * the order exists only once `/orders/create-order` is called afterwards. The
 * old app remembered which checkout that was in `sessionStorage`, which a
 * return in another tab — or a browser that restores the page in a new one —
 * does not have: money taken, no order. Here the checkout id and the delivery
 * note go into an httpOnly cookie before the redirect, and the gateway token
 * is read back from the checkout itself (measured: after an intent the summary
 * carries `gatewayPaymentToken`). Any tab of this browser can finish it.
 */

export const PENDING_CHECKOUT_COOKIE = "deligo-pending-checkout";

/** An hour: REDUNIQ's page does not wait longer, and a stale cookie must not
 *  finish tomorrow's checkout with today's note. */
export const PENDING_CHECKOUT_MAX_AGE = 60 * 60;

/** The API's delivery note has no measured limit; this keeps the cookie small. */
export const DELIVERY_NOTE_MAX = 300;

export type PendingCheckout = { id: string; notes: string };

const MONGO_ID = /^[0-9a-f]{24}$/i;

/** A checkout summary id is a Mongo id; anything else never reaches the API. */
export function isCheckoutId(value: unknown): value is string {
  return typeof value === "string" && MONGO_ID.test(value);
}

/** Reads the cookie, or a request body, into a pending checkout — or `null`. */
export function parsePendingCheckout(value: unknown): PendingCheckout | null {
  let data = value;
  if (typeof value === "string") {
    try {
      data = JSON.parse(value);
    } catch {
      return null;
    }
  }
  if (!data || typeof data !== "object") return null;
  const { id, notes } = data as Record<string, unknown>;
  if (!isCheckoutId(id)) return null;
  if (notes !== undefined && typeof notes !== "string") return null;
  return { id, notes: (notes ?? "").slice(0, DELIVERY_NOTE_MAX) };
}
