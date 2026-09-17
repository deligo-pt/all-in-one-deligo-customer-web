/**
 * The order and notification screens' words.
 *
 * Transcribed from the `Notification` frame, the `Review` modal, the
 * `Section - Progress Tracker` component set and the order frames (D-15);
 * the status words, cancel reasons and refund sentences are the old app's.
 * Data — a store's name, an amount, a code, a notification — is never here.
 */
const orders = {
  // ── The list ─────────────────────────────────────────────────────────────
  title: "My Orders",
  subtitle: "Everything you have ordered, and where each one is.",
  tabAll: "All",
  tabOngoing: "Ongoing",
  tabComplete: "Complete",
  tabCancelled: "Cancelled",
  searchLabel: "Search your orders",
  searchPlaceholder: "Order number, store or dish",
  track: "Track Order",
  details: "Details",
  reorder: "Reorder",
  orderImage: "Order photograph",
  emptyTitle: "No orders here yet",
  emptyBody: "Orders you place show up here, with their status.",
  noMatchTitle: "No matching orders",
  noMatchBody: "Try another order number, store or dish, or another tab.",
  eta: "ETA: {minutes} min",

  // ── Statuses ─────────────────────────────────────────────────────────────
  statusPending: "Placed",
  statusAccepted: "Accepted",
  statusPreparing: "Preparing",
  statusReady: "Ready for pickup",
  statusPickedUp: "Picked up by rider",
  statusOnTheWay: "On the way",
  statusDelivered: "Delivered",
  statusCollected: "Collected",
  statusRejected: "Rejected",
  statusCancelled: "Cancelled",
  statusNotCollected: "Not collected",

  // ── The tracker ──────────────────────────────────────────────────────────
  trackerLabel: "Order progress",
  stepPlaced: "Placed",
  stepConfirmed: "Confirmed",
  stepKitchen: "Kitchen",
  stepReady: "Ready",
  stepRiderPicked: "Rider Picked",
  stepOnWay: "On Way",
  stepDelivered: "Delivered",
  stepCollected: "Collected",

  // ── The detail ───────────────────────────────────────────────────────────
  riderTitle: "Your rider",
  riderImage: "Rider photograph",
  deliveryCode: "Delivery code",
  deliveryCodeBody: "Give this code to the rider when your order arrives.",
  pickupCode: "Pickup code",
  pickupCodeBody: "Show this code at the counter to collect your order.",
  endedReason: "Reason:",
  refundPending:
    "Refund in progress. Your payment is being refunded; this may take 3–5 business days.",
  refundRefunded: "Refund completed. Your payment has been refunded to your account.",
  refundNone: "No refund is due for this order.",
  cancel: "Cancel order",
  invoice: "Download invoice",
  invoicePending: "The invoice is not ready yet.",
  mapLive: "Live tracking",
  mapWaiting: "Waiting for the rider",
  mapUnavailable: "The map could not be loaded.",
  mapStore: "Restaurant",
  mapDestination: "Delivery address",
  mapRider: "Your rider",
  backToOrders: "My Orders",
  reportIssue: "Report an issue",
  writeReview: "Write a review",
  actionFailed: "That did not go through. Please try again.",

  // ── The cancel dialog ────────────────────────────────────────────────────
  cancelTitle: "Cancel this order?",
  cancelBody:
    "If the restaurant has not accepted your order yet, you will be refunded. Once they have accepted it, no refund is due.",
  cancelQuestion: "Why do you want to cancel this order?",
  cancelReasonChangedMind: "Changed my mind",
  cancelReasonMistake: "Ordered by mistake",
  cancelReasonTooLong: "Taking too long",
  cancelReasonOther: "Other",
  cancelOtherPlaceholder: "Tell us why you are cancelling",
  cancelConfirm: "Cancel order",
  cancelKeep: "Keep order",
  close: "Close",

  // ── The review ───────────────────────────────────────────────────────────
  reviewTitle: "How was your order?",
  reviewOverall: "Overall experience",
  reviewThanks: "Thank you for your rating",
  reviewPlaceholder: "Tell us more... Share your feedback (optional)",
  reviewRider: "How was {name}?",
  reviewStars: "Rate {count} out of 5",
  reviewSubmit: "Submit Review",
  reviewSkip: "Skip for now",

  // ── Notifications ────────────────────────────────────────────────────────
  notificationsTitle: "Notifications",
  notificationsSubtitle:
    "Stay updated on your orders, rides, deliveries, and exclusive offers.",
  notificationsUnread: "{count} unread",
  notificationsToday: "Today",
  notificationsYesterday: "Yesterday",
  currentOrder: "Your current order",
  markAllRead: "Mark all as read",
  viewOrder: "View order",
  notificationsEmpty: "Nothing new",
  notificationsEmptyBody: "Updates about your orders arrive here.",

  // ── The nothings ─────────────────────────────────────────────────────────
  unavailableTitle: "Your orders could not be loaded",
  unavailableBody: "Please try again in a moment.",
  notFoundTitle: "Order not found",
  notFoundBody: "This order is not on your account.",
  notificationsUnavailable: "Notifications could not be loaded",
  notificationsUnavailableBody: "Please try again in a moment.",
  previewOnly: "This is a design preview. Nothing is sent from this page.",
} satisfies Record<string, string>;

export default orders;
