/**
 * Checkout's public surface.
 *
 * One composed view, the transport contract, and the types the route needs to
 * shape its reads. Everything else — the four cards, the four dialogs, the map
 * slot — is internal, and `verify:structure` forbids reaching past this file.
 *
 * **The four dialogs are deliberately absent**, and that is the rule three
 * phases have now paid for: a value export of a barrel becomes a client
 * reference of every static importer, and this route already carries more
 * dialog than any other in the application. They are reached only through
 * `CheckoutView`'s `dynamic()` calls; their **copy types** are exported
 * because a type is erased and costs nothing.
 */
export { CheckoutView, type CheckoutCopy } from "./CheckoutView";
export { notWiredCheckout } from "./transport";
export { PAYMENT_METHODS, TIP_OPTIONS } from "./paymentMethods";
export type { PaymentMethod, PaymentMethodId } from "./paymentMethods";
export { CheckoutUnavailableError } from "./types";
export type {
  Checkout,
  CheckoutTransport,
  DeliveryAddress,
  DeliveryDay,
  DeliverySlot,
  PlaceOrderInput,
  PlacedOrder,
  ScheduledDelivery,
  Voucher,
} from "./types";
