import { CartUnavailableError, type CartTransport } from "./types";

/**
 * The cart Track B ships with: nothing, honestly.
 *
 * Every method rejects. That is not a stub waiting to be filled with sample
 * lines — a cart holding two invented pizzas would survive review precisely
 * because it looks right, and it would put a price nobody set in front of a
 * customer. Plan.md's rule is that no screen invents data, and the cart is the
 * screen where inventing it costs money.
 *
 * The consequence is deliberate and visible: the stepper, `Remove` and
 * `Place Order` are all real, focusable, labelled controls that **press and
 * refuse**, with the refusal saying why. Phase 8 settled that argument — a
 * button that cannot be pressed cannot explain itself, and a button that
 * silently does nothing is the failure this project exists to stop repeating.
 *
 * The populated design is reviewable at `/cart-states`, which is a development
 * page and prerenders as a 404. Phase 17 replaces this module's export with
 * the axios implementation and nothing above it changes.
 */
export const notWiredCart: CartTransport = {
  read() {
    return Promise.reject(new CartUnavailableError());
  },
  setQuantity() {
    return Promise.reject(new CartUnavailableError());
  },
  remove() {
    return Promise.reject(new CartUnavailableError());
  },
};
