import type { CartStore } from "@/features/cart";

/**
 * What the order screens need from the backend.
 *
 * Phase 11 builds them; **Phase 19** connects them. Money is a string, for the
 * fifth phase running: a total the customer was charged is the backend's, and
 * a type that cannot hold a float cannot re-derive one.
 */

/** Where an order is, in the customer's language. `step` drives the tracker;
 *  `label` is the backend's own word for it and is what gets rendered. */
export type OrderStep = "confirmed" | "kitchen" | "packed" | "ready" | "collected";

export const ORDER_STEPS: readonly OrderStep[] = [
  "confirmed",
  "kitchen",
  "packed",
  "ready",
  "collected",
];

/** Which bucket the list tab puts it in. Total over every status the API can
 *  send — the old project shipped two independent allowlists and every status
 *  in neither was fetched, held in memory and rendered nowhere. */
export type OrderBucket = "ongoing" | "complete" | "cancelled";

export type OrderRider = {
  name: string;
  /** "4.9 • 2,134 Trips" — verbatim, never recomputed. */
  stats?: string;
  vehicle?: string;
  plate?: string;
  photo?: string;
};

export type Order = {
  id: string;
  /** "#DG-20458". */
  reference: string;
  vendorName: string;
  /** "1x Truffle Mushroom Burger, 1x Fries" — joined by the API. */
  itemsLabel: string;
  /** "28 Oct 2026". */
  placedOn: string;
  /** Verbatim: "15.60€". */
  total: string;
  bucket: OrderBucket;
  /** "Preparing", "Delivered" — the backend's word, already localised. */
  statusLabel: string;
  /** How far along, for the tracker. Absent on a finished or cancelled order. */
  step?: OrderStep;
  /** "ETA: 12 mins". */
  eta?: string;
  image?: string;
  rider?: OrderRider;
  /** Given to the courier on arrival. Never derived, never guessed. */
  deliveryCode?: string;
  /** The same panel the cart and checkout draw, so the detail page can show
   *  what was bought without a second order type. */
  store?: CartStore;
  canCancel?: boolean;
  canReorder?: boolean;
  canReview?: boolean;
  /** Where the invoice PDF lives. Absent means there is not one yet. */
  invoiceUrl?: string;
};

/** One row on the notifications page. `action` is what the card offers, and
 *  the backend decides it — a "Track Order" link on a delivered order is how
 *  the old app sent people to a page with nothing on it. */
export type AppNotification = {
  id: string;
  title: string;
  body: string;
  /** "10 mins ago", "Yesterday, 14:30" — composed by the API, not by us. */
  when: string;
  unread?: boolean;
  image?: string;
  vertical?: string;
  action?: { label: string; href: string };
};

/** Grouped the way the design groups them: "TODAY", "YESTERDAY", a date. */
export type NotificationGroup = {
  id: string;
  label: string;
  notifications: readonly AppNotification[];
};

export type ReviewInput = {
  orderId: string;
  rating: number;
  review?: string;
  riderRating?: number;
};

export type OrdersTransport = {
  list(): Promise<readonly Order[]>;
  get(orderId: string): Promise<Order>;
  cancel(orderId: string): Promise<void>;
  reorder(orderId: string): Promise<void>;
  review(input: ReviewInput): Promise<void>;
  notifications(): Promise<readonly NotificationGroup[]>;
};

export class OrdersUnavailableError extends Error {
  constructor() {
    super("orders-not-wired");
    this.name = "OrdersUnavailableError";
  }
}
