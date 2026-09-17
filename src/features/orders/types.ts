import type { CartStore } from "@/features/cart";
import type { Fulfilment, OrderBucket, OrderStep, RefundState } from "@/lib/orders";

/**
 * What the order screens need from the backend (Phase 19), read from
 * `GET /orders` and `GET /orders/:orderId` in `services/orders/server.ts`.
 * Money is text, formatted once there.
 */

export type { Fulfilment, OrderBucket, OrderStep, RefundState };
export { ORDER_STEPS } from "@/lib/orders";

export type OrderRider = {
  name: string;
  photo?: string;
};

export type Order = {
  /** `ORD-…` — what the order routes and the cancel endpoint take. */
  id: string;
  /** The Mongo `_id` — what a rating takes. */
  recordId: string;
  reference: string;
  vendorName: string;
  /** "1× Morog Polao, 2× Chocolate Salami". */
  itemsLabel: string;
  /** Reference, store and items, for the list's search. */
  searchText: string;
  placedOn: string;
  /** Verbatim: `payoutSummary.grandTotal`, formatted once. */
  total: string;
  bucket: OrderBucket;
  /** "Preparing", "Not collected" — ours for known statuses, the API's word
   *  otherwise. */
  statusLabel: string;
  fulfilment: Fulfilment;
  /** The step reached. Absent on an order that ended without completing. */
  step?: OrderStep;
  /** "12 min" — the backend's `delivery.estimatedTime`, on a live delivery. */
  eta?: string;
  image?: string;
  rider?: OrderRider;
  /** Where the order is coming from, going to, and — while a rider carries it
   *  — where the rider is (Phase 20f). Absent on anything the API has not
   *  placed: a pickup order, an order with no coordinates, a finished one. */
  route?: OrderRoute;
  /** The code the rider asks for, until it is verified. Never generated. */
  deliveryCode?: string;
  /** The code shown at the counter on a pickup order, until it is verified. */
  pickupCode?: string;
  /** The cancellation's or rejection's recorded reason. */
  endedReason?: string;
  refund?: RefundState;
  /** The same panel the cart and checkout draw. */
  store?: CartStore;
  canCancel: boolean;
  canReorder: boolean;
  /** Products still to rate (their ids), when any are. */
  productsToRate: readonly string[];
  /** The rider can still be rated. */
  rateRider: boolean;
  /** The certified invoice is ready (`invoiceSync.isSynced`). */
  invoiceReady: boolean;
};

/** One row on the notifications page. The action is the notification's own
 *  order, when it names one. */
export type AppNotification = {
  id: string;
  title: string;
  body: string;
  /** "14:30" — within its day group. */
  when: string;
  unread: boolean;
  action?: { label: string; href: string };
};

/** Grouped the way the design groups them: "TODAY", "YESTERDAY", a date. */
export type NotificationGroup = {
  id: string;
  label: string;
  notifications: readonly AppNotification[];
};

export type ReviewInput = {
  recordId: string;
  productIds: readonly string[];
  rating: number;
  review?: string;
  riderRating?: number;
};

/** The orders feature's writes (Phase 19). Each resolves or throws `ApiError`. */
export type OrdersTransport = {
  /** `PATCH /orders/:orderId/cancel { reason }`. */
  cancel(orderId: string, reason: string): Promise<void>;
  /** `POST /orders/reorder/:orderId` — puts the order's items back in the cart. */
  reorder(orderId: string): Promise<void>;
  /** `POST /ratings/create-rating`. Immutable once sent. */
  review(input: ReviewInput): Promise<void>;
  /** `PATCH /notifications/:id/read`. */
  markRead(id: string): Promise<void>;
  /** `PATCH /notifications/mark-all-as-read`. */
  markAllRead(): Promise<void>;
};

/**
 * The three points a delivery draws (Phase 20f).
 *
 * The rider is the only one that moves, and it is absent far more often than
 * it is present: before assignment there is no rider, and the API only carries
 * a position while a rider's session is live. A map with two points and no
 * rider is still worth drawing — it is the answer to "where is this going".
 */
export type OrderRoute = {
  store?: OrderPoint;
  destination?: OrderPoint;
  rider?: OrderPoint;
};

export type OrderPoint = {
  latitude: number;
  longitude: number;
  /** "Tasca do Bairro", "Rua Augusta 145" — the marker's title. */
  label?: string;
};
