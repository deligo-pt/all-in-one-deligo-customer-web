import { OrdersUnavailableError, type OrdersTransport } from "./types";

/**
 * The orders Track B ships with: nothing.
 *
 * Every method rejects, `cancel` and `review` included — both are writes a
 * customer cannot take back, and a stub that resolved would tell them an order
 * was cancelled, or a review submitted, when neither happened.
 *
 * The populated design is at `/orders-states`, a development page that 404s in
 * production. Phase 19 replaces this module's export.
 */
export const notWiredOrders: OrdersTransport = {
  list() {
    return Promise.reject(new OrdersUnavailableError());
  },
  get() {
    return Promise.reject(new OrdersUnavailableError());
  },
  cancel() {
    return Promise.reject(new OrdersUnavailableError());
  },
  reorder() {
    return Promise.reject(new OrdersUnavailableError());
  },
  review() {
    return Promise.reject(new OrdersUnavailableError());
  },
  notifications() {
    return Promise.reject(new OrdersUnavailableError());
  },
};
