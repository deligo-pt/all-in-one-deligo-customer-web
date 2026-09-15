import type { SummaryCopy } from "@/features/cart";
import type {
  NotificationCopy,
  OrderDetailCopy,
  OrderListCopy,
} from "@/features/orders";

type T = (k: string, values?: Record<string, string | number>) => string;

/**
 * The three views' copy for the development states page, from the same
 * `orders` and `cart` keys `services/orders/copy.ts` reads for the routes.
 */
const summaryCopy = (cart: T): SummaryCopy => ({
  deliveryIn: cart("deliveryIn"),
  addMoreItems: cart("addMoreItems"),
  applyVoucher: cart("applyVoucher"),
  orderSummary: cart("orderSummary"),
  charge: {
    subtotal: cart("chargeSubtotal"),
    delivery: cart("chargeDelivery"),
    service: cart("chargeService"),
    tip: cart("chargeTip"),
    discount: cart("chargeDiscount"),
  },
  grandTotal: cart("grandTotal"),
  placeOrder: cart("placeOrder"),
});

export function listCopy(t: T): OrderListCopy {
  return {
    title: t("title"),
    subtitle: t("subtitle"),
    tab: {
      all: t("tabAll"),
      ongoing: t("tabOngoing"),
      complete: t("tabComplete"),
      cancelled: t("tabCancelled"),
    },
    searchLabel: t("searchLabel"),
    searchPlaceholder: t("searchPlaceholder"),
    track: t("track"),
    details: t("details"),
    reorder: t("reorder"),
    orderImage: t("orderImage"),
    noMatchTitle: t("noMatchTitle"),
    noMatchBody: t("noMatchBody"),
    emptyTitle: t("emptyTitle"),
    emptyBody: t("emptyBody"),
    unavailableTitle: t("unavailableTitle"),
    unavailableBody: t("unavailableBody"),
    actionFailed: t("actionFailed"),
  };
}

export function detailCopy(t: T, cart: T, riderName?: string): OrderDetailCopy {
  return {
    tracker: {
      label: t("trackerLabel"),
      step: {
        placed: t("stepPlaced"),
        confirmed: t("stepConfirmed"),
        kitchen: t("stepKitchen"),
        ready: t("stepReady"),
        "rider-picked": t("stepRiderPicked"),
        "on-way": t("stepOnWay"),
        delivered: t("stepDelivered"),
        collected: t("stepCollected"),
      },
    },
    summary: summaryCopy(cart),
    review: {
      title: t("reviewTitle"),
      close: t("close"),
      overall: t("reviewOverall"),
      thanks: t("reviewThanks"),
      placeholder: t("reviewPlaceholder"),
      riderQuestion: t("reviewRider", { name: riderName ?? "" }),
      starLabels: [1, 2, 3, 4, 5].map((count) => t("reviewStars", { count })),
      submit: t("reviewSubmit"),
      skip: t("reviewSkip"),
    },
    cancelDialog: {
      title: t("cancelTitle"),
      body: t("cancelBody"),
      close: t("close"),
      question: t("cancelQuestion"),
      reasons: [
        t("cancelReasonChangedMind"),
        t("cancelReasonMistake"),
        t("cancelReasonTooLong"),
      ],
      other: t("cancelReasonOther"),
      otherPlaceholder: t("cancelOtherPlaceholder"),
      confirm: t("cancelConfirm"),
      keep: t("cancelKeep"),
    },
    backToOrders: t("backToOrders"),
    reportIssue: t("reportIssue"),
    riderTitle: t("riderTitle"),
    riderImage: t("riderImage"),
    deliveryCode: t("deliveryCode"),
    deliveryCodeBody: t("deliveryCodeBody"),
    pickupCode: t("pickupCode"),
    pickupCodeBody: t("pickupCodeBody"),
    endedTitle: t("endedReason"),
    refund: {
      pending: t("refundPending"),
      refunded: t("refundRefunded"),
      none: t("refundNone"),
    },
    cancel: t("cancel"),
    reorder: t("reorder"),
    invoice: t("invoice"),
    invoicePending: t("invoicePending"),
    writeReview: t("writeReview"),
    actionFailed: t("actionFailed"),
  };
}

export function notificationCopy(t: T, cart: T, unread: number): NotificationCopy {
  return {
    title: t("notificationsTitle"),
    subtitle: t("notificationsSubtitle"),
    unread: unread > 0 ? t("notificationsUnread", { count: unread }) : undefined,
    markAllRead: t("markAllRead"),
    currentOrder: t("currentOrder"),
    trackOrder: t("track"),
    summary: summaryCopy(cart),
    emptyTitle: t("notificationsEmpty"),
    emptyBody: t("notificationsEmptyBody"),
    unavailableTitle: t("notificationsUnavailable"),
    unavailableBody: t("notificationsUnavailableBody"),
    actionFailed: t("actionFailed"),
  };
}
