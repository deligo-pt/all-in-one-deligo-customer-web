import { ratingBody } from "@/lib/orders";
import type { OrdersTransport } from "./types";

/**
 * The orders feature's writes, through the one API client (Phase 19). The
 * session module — and axios with it — loads on the first press.
 *
 * Measured on the owner's account with permission: a cancel with a reason
 * answered `CANCELED` with `refundStatus: PENDING`, and a second one
 * `ORDER_CANNOT_BE_CANCELED_OR_REJECTED_AT_STAGE`; a reorder while the store
 * was closed answered `STORE_CLOSED_OR_UNAPPROVED` and left the cart as it
 * was; both read endpoints answered on already-read notifications. A rating
 * was not sent (the schema was measured with requests that could only fail).
 */
const session = () => import("@/services/session/browser");

export const ordersApi: OrdersTransport = {
  async cancel(orderId, reason) {
    const { browserApi } = await session();
    await browserApi().patch(`/orders/${encodeURIComponent(orderId)}/cancel`, {
      reason,
    });
  },
  async reorder(orderId) {
    const { browserApi } = await session();
    await browserApi().post(`/orders/reorder/${encodeURIComponent(orderId)}`);
  },
  async review(input) {
    const body = ratingBody(input);
    if (!body) throw new Error();
    const { browserApi } = await session();
    await browserApi().post("/ratings/create-rating", body);
  },
  async markRead(id) {
    const { browserApi } = await session();
    await browserApi().patch(`/notifications/${encodeURIComponent(id)}/read`);
  },
  async markAllRead() {
    const { browserApi } = await session();
    await browserApi().patch("/notifications/mark-all-as-read");
  },
};
