import type { CartStore } from "@/features/cart";

/**
 * What checkout needs from the backend, and nothing about how it arrives.
 *
 * Phase 10 builds the screens; **Phase 18** connects them to the order and
 * payment endpoints. Money is a string here for the fourth phase running, and
 * the reason has not changed: `30.97€` is what the backend sends and what the
 * customer is charged, and a type that cannot hold a float cannot quietly
 * re-derive one. Checkout is the screen where that stops being a principle and
 * starts being the amount on a card statement.
 *
 * **The store is the cart's `CartStore`, imported rather than restated.** The
 * design draws the same 415px panel on both screens, and D-4's answer is that
 * one store is one order — so the thing being checked out is exactly the thing
 * the cart grouped. A second, slightly different order type here is how the
 * cart and the checkout come to disagree about what is being bought.
 */

export type { CartStore };

/** Where it is going. One line, formatted by whoever knows the country's
 *  conventions — not assembled here from parts. */
export type DeliveryAddress = {
  id: string;
  /** "Home", "Work" — the customer's own name for it, when they gave one. */
  label?: string;
  /** "Avenida da Liberdade 125, Lisbon". */
  line: string;
  /** A static map image for the slot the design draws at 817×210. Absent is
   *  normal and renders as a placeholder — see the note in `MapSlot`. */
  mapImage?: string;
};

/** A booked delivery window, when the customer has chosen one. */
export type ScheduledDelivery = {
  /** "Tomorrow · 26 Aug" — the sentence, already localised by the API. */
  day: string;
  /** "10:00 – 12:00". */
  window: string;
};

/**
 * One selectable window in the Smart Delivery picker.
 *
 * `availability` is the backend's own phrasing — "6 slots available",
 * "3 slots left", "Almost full · 2 left" — and `tone` is how it is drawn, not
 * what it says. Deriving the tone from a number would mean parsing a sentence
 * to find out whether it was urgent, and the backend already knows.
 */
export type DeliverySlot = {
  id: string;
  /** "10:00 – 12:00". */
  window: string;
  availability?: string;
  tone?: "normal" | "urgent";
  /** The design's highlighted row — "Recommended: 10:00–12:00". */
  recommended?: boolean;
};

export type DeliveryDay = {
  id: string;
  /** "TODAY", "TMW", "THU" — the strip's short label, as sent. */
  weekday: string;
  /** "25", "26". */
  day: string;
  /** "Tomorrow · 26 Aug", for the header once chosen. */
  label: string;
  slots: readonly DeliverySlot[];
};

/**
 * A voucher, as the sheet lists it.
 *
 * `state` is the backend's, not ours. Whether `WELCOME5` is unavailable to
 * *this* customer is a question about their order history, their first-order
 * status and the voucher's own rules, and a frontend that decided it would be
 * guessing at three of them.
 */
export type Voucher = {
  code: string;
  description: string;
  /** "You save €8.00", "Min. order €20 · Use by Oct 5, 2026" — verbatim. */
  terms?: string;
  state: "applied" | "available" | "unavailable";
};

/** The screen, as one read. */
export type Checkout = {
  store: CartStore;
  address?: DeliveryAddress;
  schedule?: ScheduledDelivery;
};

/**
 * What the customer has chosen, and what Phase 18 sends.
 *
 * `tip` is the option's own string — "2€" — not a number. The frontend does
 * not add it to anything; the backend restates the total with the tip in it,
 * which is why `CartTotals` comes back from the server rather than being
 * patched here.
 */
export type PlaceOrderInput = {
  storeId: string;
  addressId?: string;
  instruction?: string;
  paymentMethodId: string;
  tip?: string;
  voucherCode?: string;
  slotId?: string;
};

/** What comes back, and what the confirmation screen renders. */
export type PlacedOrder = {
  /** "DG-8291". */
  reference: string;
  /** "Tomorrow · 26 Aug · 10:00–12:00", already composed by the API. */
  when?: string;
  addressLine?: string;
  paymentLabel?: string;
  paymentState?: string;
  /** Verbatim: "30.97€". */
  total: string;
};

/**
 * What Phase 18 implements.
 *
 * Four reads and one write, and the write is the only one in this project so
 * far that spends money. It resolves or throws; there is no `{ ok: false }`,
 * for the same reason the catalogue has none — one place catches it, rather
 * than a branch at every call site that is eventually forgotten at one.
 */
export type CheckoutTransport = {
  read(): Promise<Checkout>;
  listVouchers(): Promise<readonly Voucher[]>;
  listSlots(): Promise<readonly DeliveryDay[]>;
  placeOrder(input: PlaceOrderInput): Promise<PlacedOrder>;
};

export class CheckoutUnavailableError extends Error {
  constructor() {
    super("checkout-not-wired");
    this.name = "CheckoutUnavailableError";
  }
}
