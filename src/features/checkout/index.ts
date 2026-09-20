/**
 * Checkout's public surface.
 *
 * The composed view and the start step `/checkout` renders, and the types. The
 * cards and the two dialogs are internal, and the dialogs arrive only through
 * `CheckoutView`'s `dynamic()` calls. What happens after the provider's page is
 * `features/payment`, so the return routes do not ship this screen.
 */
export { CheckoutView, type CheckoutCopy } from "./CheckoutView";
export { CheckoutStart, type StartCopy } from "./CheckoutStart";
export type { PaymentMethodId } from "./paymentMethods";
export type {
  Checkout,
  CheckoutTransport,
  DeliveryAddress,
  PaymentChoice,
  PlacedOrder,
  SavedAddress,
  SavedCard,
  Voucher,
} from "./types";
