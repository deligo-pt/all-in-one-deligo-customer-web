import type {
  NotificationCopy,
  OrderDetailCopy,
  OrderListCopy,
} from "@/features/orders";

/**
 * The three views' copy, built from the `orders` and `cart` dictionaries.
 *
 * Two, because the order detail and the notification page both render the
 * cart's 415px summary panel whole — its copy belongs with the panel rather
 * than copied into a second dictionary that could drift from it.
 */
export function listCopy(t: (k: string) => string): OrderListCopy {
  return {
    title: t("title"),
    subtitle: t("subtitle"),
    tab: {
      all: t("tabAll"),
      ongoing: t("tabOngoing"),
      complete: t("tabComplete"),
      cancelled: t("tabCancelled"),
    },
    track: t("track"),
    details: t("details"),
    reorder: t("reorder"),
    orderImage: t("orderImage"),
    emptyTitle: t("emptyTitle"),
    emptyBody: t("emptyBody"),
    unavailableTitle: t("unavailableTitle"),
    unavailableBody: t("unavailableBody"),
    notWired: t("notWired"),
  };
}

export function summaryCopy(cart: (k: string) => string) {
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

export function detailCopy(
  t: (k: string, v?: Record<string, string | number>) => string,
  cart: (k: string) => string,
  riderName = "",
): OrderDetailCopy {
  return {
    tracker: {
      label: t("trackerLabel"),
      step: {
        confirmed: t("stepConfirmed"),
        kitchen: t("stepKitchen"),
        packed: t("stepPacked"),
        ready: t("stepReady"),
        collected: t("stepCollected"),
        picked: t("stepPicked"),
        "rider-picked": t("stepRiderPicked"),
        "on-way": t("stepOnWay"),
      },
    },
    summary: summaryCopy(cart),
    review: {
      title: t("reviewTitle"),
      close: t("reviewSkip"),
      status: t("details"),
      overall: t("reviewOverall"),
      thanks: t("reviewThanks"),
      placeholder: t("reviewPlaceholder"),
      riderQuestion: t("reviewRider", { name: riderName }),
      starLabels: [1, 2, 3, 4, 5].map((count) => t("reviewStars", { count })),
      submit: t("reviewSubmit"),
      skip: t("reviewSkip"),
      notWired: t("notWired"),
    },
    riderTitle: t("riderTitle"),
    deliveryCode: t("deliveryCode"),
    deliveryCodeBody: t("deliveryCodeBody"),
    cancel: t("cancel"),
    reorder: t("reorder"),
    invoice: t("invoice"),
    writeReview: t("writeReview"),
    riderImage: t("riderImage"),
    notWired: t("notWired"),
  };
}

export function notificationCopy(
  t: (k: string, v?: Record<string, string | number>) => string,
  cart: (k: string) => string,
  unread = 0,
): NotificationCopy {
  return {
    title: t("notificationsTitle"),
    subtitle: t("notificationsSubtitle"),
    all: t("notificationsAll"),
    unread: unread > 0 ? t("notificationsUnread", { count: unread }) : undefined,
    summary: summaryCopy(cart),
    notificationImage: t("notificationImage"),
    emptyTitle: t("notificationsEmpty"),
    emptyBody: t("notificationsEmptyBody"),
    unavailableTitle: t("notificationsUnavailable"),
    unavailableBody: t("notificationsUnavailableBody"),
    notWired: t("notWired"),
  };
}
