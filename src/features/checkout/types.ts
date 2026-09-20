import type { CartStore } from "@/features/cart";
import type { PaymentMethodId } from "./paymentMethods";

/**
 * What checkout needs from the backend (Phase 18), measured on the live API.
 *
 * A checkout is a **summary document** the backend builds from the cart's
 * active store: `POST /checkout { useCart: true }` returns it, and
 * `GET /checkout/summary/:id` reads it back. It is priced by the backend —
 * items, VAT, service charge, delivery by distance, offer — and it binds to the
 * customer's **active** delivery address. Its schema accepts `useCart`,
 * `fulfillmentType`, `pickupTime` and `vendorInstructions` and nothing else:
 * no tip, no delivery window, no address id (measured).
 *
 * Money is text, formatted once in `services/checkout/server.ts`.
 */

export type { CartStore };

/** Where it is going, as the summary states it. */
export type DeliveryAddress = {
  /** "RC89+XRG, Dhaka, Bangladesh" — the address lines, joined. */
  line: string;
  /** "2.88 km · 12 min" — the backend's own distance and estimate. */
  detail?: string;
};

/** One of the customer's saved addresses (`GET /profile`). */
export type SavedAddress = {
  id: string;
  /** "Home", "Office", or the customer's own name for it. */
  label: string;
  line: string;
  active: boolean;
};

/** A saved card (`GET /payment-tokens`): a brand and four digits, never a
 *  number (D-14). `id` is our backend's handle, not REDUNIQ's. */
export type SavedCard = {
  id: string;
  /** "Mastercard ending in 4444", as sent. */
  label: string;
  /** "12/34", as sent. */
  expiry: string;
  isDefault: boolean;
};

/**
 * An offer the checkout can take (`GET /offers/available-offers/:id`).
 *
 * `identifier` is what `validate-apply-offer` needs, and it is not always the
 * code: an auto-apply offer is named by its id, the others by their code
 * (the API's own note in the collection).
 */
export type Voucher = {
  id: string;
  identifier: string;
  title: string;
  code?: string;
  description?: string;
  /** "40% off · up to 10,00 € · min. order 10,00 € · until 15/09/2026". */
  terms?: string;
  state: "applied" | "available" | "unavailable";
  /** The backend's reason when it is unavailable, in the request's language. */
  message?: string;
};

/** The screen, as one read. */
export type Checkout = {
  /** The summary's id. A voucher, an address or a pickup change produces a new one. */
  id: string;
  store: CartStore;
  /** `fulfillmentType` as the summary states it. */
  fulfilment: "delivery" | "pickup";
  /** The chosen slot's start (ISO), on a pickup — kept when a rebuild
   *  (removing a voucher) makes a new summary. */
  pickupTime?: string;
  /** "Today · 14:00", resolved on the server from `pickupTime`. */
  pickupLabel?: string;
  address?: DeliveryAddress;
  /** The applied offer, if any — shown so it can be removed. */
  voucherCode?: string;
};

/** What the confirmation renders, read from `GET /orders/:orderId`. */
export type PlacedOrder = {
  /** "ORD-L7QZMLXPVF". */
  reference: string;
  when?: string;
  addressLine?: string;
  paymentLabel?: string;
  paymentState?: string;
  /** Verbatim: the order's `payoutSummary.grandTotal`, formatted once. */
  total: string;
};

/** How the customer pays: through the provider's page, or with a saved card. */
export type PaymentChoice =
  | { kind: "gateway"; method: PaymentMethodId; saveCard: boolean }
  | { kind: "saved-card"; cardId: string };

/**
 * The checkout's writes (Phase 18). Each resolves or throws `ApiError`.
 *
 * Only `pay` spends money, and it never resolves with an order it did not see:
 * the gateway path resolves with the provider's URL (the order is created on
 * return), the saved-card path with the order's reference when the API names
 * one.
 */
export type CheckoutTransport = {
  /** `POST /checkout { useCart: true }` → the new summary's id. With a
   *  pickup time (ISO, a 30-minute slot) the summary is a self-pickup one. */
  start(pickupTime?: string): Promise<string>;
  /** `POST /offers/validate-apply-offer` on this summary. */
  applyVoucher(checkoutId: string, identifier: string): Promise<void>;
  /** `PATCH /customers/toggle-delivery-address-status/:id`, then `start()`. */
  chooseAddress(addressId: string): Promise<string>;
  pay(
    checkoutId: string,
    choice: PaymentChoice,
    notes: string,
  ): Promise<{ redirectUrl: string } | { orderId?: string }>;
};
