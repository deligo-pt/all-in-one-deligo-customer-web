/**
 * The orders feature's public surface.
 *
 * Three composed views and the types. The card, the tracker, the star input
 * and the two dialogs are internals — a value export of a barrel becomes a
 * client reference of every static importer.
 */
export { OrderList, type OrderListCopy } from "./OrderList";
export { OrderDetail, type OrderDetailCopy } from "./OrderDetail";
export { NotificationList, type NotificationCopy } from "./NotificationList";
export { ORDER_STEPS } from "./types";
export type {
  AppNotification,
  Fulfilment,
  NotificationGroup,
  Order,
  OrderPoint,
  OrderRoute,
  OrderBucket,
  OrderRider,
  OrderStep,
  OrdersTransport,
  RefundState,
  ReviewInput,
} from "./types";
