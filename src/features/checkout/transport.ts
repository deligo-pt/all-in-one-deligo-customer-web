import { CheckoutUnavailableError, type CheckoutTransport } from "./types";

/**
 * The checkout Track B ships with: nothing, honestly.
 *
 * Every method rejects, including `placeOrder`. That last one matters more
 * than the others put together — a stub that *resolved* would put an "Order
 * Confirmed!" screen, a reference number and a total in front of a customer
 * for an order that was never placed, and it would look completely right doing
 * it. There is no version of this file that pretends.
 *
 * The screens underneath are real: the payment picker, the tip row, the
 * instruction field, the three modals and the summary panel are all built and
 * operable. What they cannot do is submit, and they say so when pressed.
 *
 * The populated design is reviewable at `/checkout-states`, which is a
 * development page and prerenders as a 404. Phase 18 replaces this module's
 * export with the axios implementation and nothing above it changes.
 */
export const notWiredCheckout: CheckoutTransport = {
  read() {
    return Promise.reject(new CheckoutUnavailableError());
  },
  listVouchers() {
    return Promise.reject(new CheckoutUnavailableError());
  },
  listSlots() {
    return Promise.reject(new CheckoutUnavailableError());
  },
  placeOrder() {
    return Promise.reject(new CheckoutUnavailableError());
  },
};
