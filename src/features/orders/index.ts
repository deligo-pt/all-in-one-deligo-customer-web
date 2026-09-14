/**
 * The orders feature's public surface.
 *
 * Three composed views and the transport contract. The card, the tracker, the
 * star input and the review dialog are internals — the dialog especially, for
 * the reason three phases have now paid for: a value export of a barrel
 * becomes a client reference of every static importer.
 */
export { OrderList, type OrderListCopy } from "./OrderList";
export { OrderDetail, type OrderDetailCopy } from "./OrderDetail";
export { NotificationList, type NotificationCopy } from "./NotificationList";
export { notWiredOrders } from "./transport";
export { ORDER_STEPS, OrdersUnavailableError } from "./types";
export type {
  AppNotification,
  NotificationGroup,
  Order,
  OrderBucket,
  OrderRider,
  OrderStep,
  TrackedVertical,
  OrdersTransport,
  ReviewInput,
} from "./types";
