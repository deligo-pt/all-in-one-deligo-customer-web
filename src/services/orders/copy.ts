import type { SummaryCopy } from "@/features/cart";
import type {
  NotificationCopy,
  OrderDetailCopy,
  OrderListCopy,
} from "@/features/orders";
import { getTranslations } from "@/i18n/server";

/** The order screens' words, resolved on the server for the three routes. */

async function summaryCopy(): Promise<SummaryCopy> {
  const cart = await getTranslations("cart");
  return {
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
  };
}

export async function orderListCopy(): Promise<OrderListCopy> {
  const t = await getTranslations("orders");
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

export async function orderDetailCopy(riderName?: string): Promise<OrderDetailCopy> {
  const [t, summary] = await Promise.all([getTranslations("orders"), summaryCopy()]);
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
    summary,
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

export async function notificationListCopy(unread: number): Promise<NotificationCopy> {
  const [t, summary] = await Promise.all([getTranslations("orders"), summaryCopy()]);
  return {
    title: t("notificationsTitle"),
    subtitle: t("notificationsSubtitle"),
    unread: unread > 0 ? t("notificationsUnread", { count: unread }) : undefined,
    markAllRead: t("markAllRead"),
    currentOrder: t("currentOrder"),
    trackOrder: t("track"),
    summary,
    emptyTitle: t("notificationsEmpty"),
    emptyBody: t("notificationsEmptyBody"),
    unavailableTitle: t("notificationsUnavailable"),
    unavailableBody: t("notificationsUnavailableBody"),
    actionFailed: t("actionFailed"),
  };
}
