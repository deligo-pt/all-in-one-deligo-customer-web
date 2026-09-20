/**
 * The browser's half of finishing a payment (Phase 18): three calls to this
 * site's own `/api/checkout` handlers, which hold the remembered checkout in an
 * httpOnly cookie. No axios here — these are same-origin requests, like
 * `/api/session`, and not API calls.
 */

/** Remembers the checkout before the redirect. `false` if it could not be. */
export async function rememberCheckout(id: string, notes: string): Promise<boolean> {
  const response = await fetch("/api/checkout/pending", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, notes }),
  }).catch(() => null);
  return Boolean(response?.ok);
}

/** After REDUNIQ: creates the order on our server from the remembered checkout. */
export async function completePayment(
  checkoutId?: string,
): Promise<{ orderId?: string; message?: string; missing?: boolean }> {
  const response = await fetch("/api/checkout/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(checkoutId ? { id: checkoutId } : {}),
  });
  const body = (await response.json().catch(() => ({}))) as {
    orderId?: string;
    message?: string;
  };
  if (response.ok) return { orderId: body.orderId };
  return { message: body.message, missing: response.status === 404 };
}

/** A payment the customer abandoned or the gateway refused: reset the summary
 *  so it can be paid again, and forget it. */
export async function abandonPayment(): Promise<void> {
  await fetch("/api/checkout/pending", { method: "DELETE" }).catch(() => undefined);
}
