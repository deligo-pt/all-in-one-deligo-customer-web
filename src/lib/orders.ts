/**
 * The order rules that need no request and no framework (Phase 19), carried
 * from the old app's `orderStatus`, `refund`, `orderTimeline` and
 * `ratingPayload` modules and re-measured on the live API:
 *
 * - statuses seen on the owner's 62 orders: PENDING, DELIVERED,
 *   PICKED_UP_BY_CUSTOMER, CANCELED (one L), REJECTED, NO_SHOW; the API's own
 *   enum adds ACCEPTED, PREPARING, READY_FOR_PICKUP, PICKED_UP, ON_THE_WAY;
 * - a cancel needs a non-empty `reason` and answers
 *   `ORDER_CANNOT_BE_CANCELED_OR_REJECTED_AT_STAGE` past the point of no return;
 *   a cancelled paid order keeps `paymentStatus: PAID` with
 *   `refundStatus: PENDING`, so the refund is read from `refundStatus` first;
 * - `/ratings/create-rating` is strict: `orderId` (the Mongo id),
 *   `productRatings[{ productId, rating 1–5, review? }]` and/or
 *   `deliveryRating{ rating 1–5, review? }` — `vendorRating` is rejected.
 */

export type OrderBucket = "ongoing" | "complete" | "cancelled";

export type OrderStep =
  | "placed"
  | "confirmed"
  | "kitchen"
  | "ready"
  | "rider-picked"
  | "on-way"
  | "delivered"
  | "collected";

export type Fulfilment = "delivery" | "pickup";

/** Each fulfilment's journey, as the API's statuses walk it. */
export const ORDER_STEPS: Record<Fulfilment, readonly OrderStep[]> = {
  delivery: [
    "placed",
    "confirmed",
    "kitchen",
    "ready",
    "rider-picked",
    "on-way",
    "delivered",
  ],
  pickup: ["placed", "confirmed", "kitchen", "ready", "collected"],
};

const STEP_OF: Record<string, OrderStep> = {
  PENDING: "placed",
  ACCEPTED: "confirmed",
  ASSIGNED: "confirmed",
  PREPARING: "kitchen",
  READY_FOR_PICKUP: "ready",
  PICKED_UP: "rider-picked",
  ON_THE_WAY: "on-way",
  DELIVERED: "delivered",
  PICKED_UP_BY_CUSTOMER: "collected",
};

/** Upper-case, and fold the API's `CANCELED` onto `CANCELLED`. */
export function normaliseStatus(status: unknown): string {
  const upper = typeof status === "string" ? status.toUpperCase() : "";
  return upper === "CANCELED" ? "CANCELLED" : upper;
}

const COMPLETE = new Set(["DELIVERED", "PICKED_UP_BY_CUSTOMER"]);
const ENDED = new Set(["CANCELLED", "REJECTED", "NO_SHOW"]);

/**
 * Which tab an order is in. **Total**: every status lands in exactly one, and a
 * status this build has never seen is ongoing — a new step is likelier than a
 * new ending, and the ongoing card only offers to track it.
 */
export function orderBucket(status: unknown): OrderBucket {
  const s = normaliseStatus(status);
  if (COMPLETE.has(s)) return "complete";
  if (ENDED.has(s)) return "cancelled";
  return "ongoing";
}

/** The step reached, or `undefined` for an order that ended without one. */
export function orderStep(status: unknown): OrderStep | undefined {
  return STEP_OF[normaliseStatus(status)];
}

/** The customer may still call it off: live, and paid (an absent `isPaid`
 *  still offers the button; the API has the final word). */
export function canCancel(status: unknown, isPaid: unknown): boolean {
  return orderBucket(status) === "ongoing" && isPaid !== false;
}

export type RefundState = "pending" | "refunded" | "none";

/** For an order that ended with the money taken. `refundStatus` outranks the
 *  payment fields, which cannot tell "refund on its way" from "no refund". */
export function refundState(order: {
  orderStatus?: unknown;
  refundStatus?: unknown;
  paymentStatus?: unknown;
}): RefundState | undefined {
  const status = normaliseStatus(order.orderStatus);
  if (status !== "CANCELLED" && status !== "REJECTED") return undefined;
  const declared = typeof order.refundStatus === "string" ? order.refundStatus : "";
  if (declared === "PENDING") return "pending";
  if (declared === "REFUNDED") return "refunded";
  if (declared === "NOT_APPLICABLE") return "none";
  return order.paymentStatus === "REFUNDED" ? "refunded" : undefined;
}

/** The note recorded against the current status (a cancel's or a rejection's
 *  reason), newest first, skipping blank notes. */
export function statusNote(
  status: unknown,
  history: readonly { status?: unknown; note?: unknown }[] | undefined,
): string | undefined {
  const target = normaliseStatus(status);
  for (const entry of [...(history ?? [])].reverse()) {
    if (normaliseStatus(entry.status) !== target) continue;
    const note = typeof entry.note === "string" ? entry.note.trim() : "";
    if (note) return note;
  }
  return undefined;
}

export type RatingInput = {
  /** The order's Mongo `_id`, not `ORD-…`. */
  recordId: string;
  productIds: readonly string[];
  rating: number;
  review?: string;
  riderRating?: number;
};

const score = (n: unknown) =>
  typeof n === "number" && Number.isInteger(n) && n >= 1 && n <= 5 ? n : undefined;

/**
 * The exact body `/ratings/create-rating` takes, built key by key so nothing a
 * caller carries can reach a strict schema. The design asks for one overall
 * score (D-20): it is the score for every product in the order. `null` when
 * there is nothing to send.
 */
export function ratingBody(input: RatingInput): Record<string, unknown> | null {
  const rating = score(input.rating);
  const review = input.review?.trim();
  const productRatings = rating
    ? [...new Set(input.productIds.filter((id) => typeof id === "string" && id))].map(
        (productId) => ({ productId, rating, ...(review ? { review } : {}) }),
      )
    : [];
  const riderRating = score(input.riderRating);
  if (!input.recordId || (productRatings.length === 0 && !riderRating)) return null;
  return {
    orderId: input.recordId,
    ...(productRatings.length ? { productRatings } : {}),
    ...(riderRating ? { deliveryRating: { rating: riderRating } } : {}),
  };
}

/** Orders matching every word of a search, over reference, store and items —
 *  the API's `searchTerm` matches the order id only (measured). */
export function matchesSearch(haystack: string, term: string): boolean {
  const fold = (s: string) =>
    s
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase();
  const words = fold(term).split(/\s+/).filter(Boolean);
  const hay = fold(haystack);
  return words.every((word) => hay.includes(word));
}

/**
 * One language out of the API's two (Phase 20h fix).
 *
 * Notification titles and messages arrive with **both languages in one
 * string**, joined by " / " — measured on the owner's account:
 *
 *   "Your BBQ will be removed from the cart in 28 minutes /
 *    O seu Churrasco será removido do carrinho dentro de 28 minutos"
 *
 * A customer reading English should not be handed the Portuguese half as
 * well. The API gives no structure to work from, so the split is on the
 * separator it uses, and only when there is **exactly one** — a message that
 * legitimately contains " / " is left whole rather than cut in half.
 *
 * English is first, Portuguese second: the order the backend sends, and the
 * order every measured message has used.
 */
export function oneLanguage(text: string, locale: string): string {
  const parts = text.split(" / ");
  if (parts.length !== 2) return text.trim();
  const [english, portuguese] = parts;
  const chosen = locale.startsWith("pt") ? portuguese : english;
  return (chosen ?? text).trim();
}

/** What a notification is about, from the API's `type`/`channelId`. The icon
 *  is chosen from this, not from the words in the title. */
export type NotificationKind = "order" | "offer" | "security" | "general";

export function notificationKind(
  type: string | undefined,
  hasOrder: boolean,
): NotificationKind {
  const value = (type ?? "").toUpperCase();
  if (value.includes("ORDER") || value.includes("DELIVER") || hasOrder) return "order";
  if (value.includes("PROMO") || value.includes("OFFER") || value.includes("CART")) {
    return "offer";
  }
  if (value.includes("SECURITY") || value.includes("LOGIN") || value.includes("OTP")) {
    return "security";
  }
  return "general";
}
