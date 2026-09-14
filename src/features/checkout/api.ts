import { rememberCheckout } from "@/services/checkout/browser";
import { PAYMENT_METHODS } from "./paymentMethods";
import type { CheckoutTransport } from "./types";

/**
 * The checkout's writes, through the one API client (Phase 18). The session
 * module — and axios with it — loads on the first press, never with a page.
 *
 * Measured on the owner's account with permission: a summary is built from the
 * cart and nothing in the cart changes; an invalid code answers
 * `400 INVALID_OFFER_OR_PROMO_CODE`; a payment intent answers
 * `{ redirectUrl, paymentToken, cardWillBeSaved }` and leaves the gateway token
 * on the summary; `handle-payment-failure` resets it (`paymentStatus: FAILED`).
 * No payment was made and no order was created while measuring.
 */
const session = () => import("@/services/session/browser");

export const checkoutApi: CheckoutTransport = {
  async start() {
    const { browserApi } = await session();
    const { data } = await browserApi().post("/checkout", { useCart: true });
    const id: unknown = data?.data?._id;
    if (typeof id !== "string") throw new Error();
    return id;
  },

  async applyVoucher(checkoutId, identifier) {
    const { browserApi } = await session();
    await browserApi().post("/offers/validate-apply-offer", {
      checkoutId,
      offerIdentifier: identifier,
    });
  },

  /** Account-wide: the chosen address becomes the active one everywhere, which
   *  is the only lever the API has — `/checkout` rejects an address id. */
  async chooseAddress(addressId) {
    const { browserApi } = await session();
    await browserApi().patch(`/customers/toggle-delivery-address-status/${addressId}`);
    return checkoutApi.start();
  },

  async pay(checkoutId, choice, notes) {
    const { browserApi } = await session();
    const api = browserApi();

    if (choice.kind === "saved-card") {
      // One call, no redirect: when it resolves the order exists. The API's
      // response shape for the order is not measured (it charges a real card),
      // so the reference is read only if it is there.
      const { data } = await api.post("/payment/reduniq/pay-with-saved-token", {
        checkoutSummaryId: checkoutId,
        paymentTokenId: choice.cardId,
      });
      const orderId: unknown = data?.data?.orderId;
      return typeof orderId === "string" ? { orderId } : {};
    }

    const method = PAYMENT_METHODS.find((m) => m.id === choice.method);
    if (!method) throw new Error();
    const { data } = await api.post("/payment/reduniq/create-payment-intent", {
      checkoutSummaryId: checkoutId,
      paymentMethod: method.api,
      // Tokenising is a card thing; the old app sent the flag only for CARD.
      ...(method.api === "CARD" && choice.saveCard ? { saveCard: true } : {}),
    });
    const redirectUrl: unknown = data?.data?.redirectUrl;

    // Remember the checkout before leaving, or the order cannot be created on
    // return. If it cannot be remembered, the customer must not be sent to pay.
    if (
      typeof redirectUrl !== "string" ||
      !(await rememberCheckout(checkoutId, notes))
    ) {
      await api
        .post(`/payment/reduniq/handle-payment-failure/${checkoutId}`)
        .catch(() => undefined);
      throw new Error();
    }
    return { redirectUrl };
  },
};
