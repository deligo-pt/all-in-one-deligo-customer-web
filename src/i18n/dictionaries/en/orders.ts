/**
 * The order and notification screens' words.
 *
 * Transcribed from the `Notification` frame (1440×1802), the `Review` modal
 * (720×561), the `Section - Progress Tracker` component set, and the 412px
 * mobile order frames the desktop file does not have (D-15). Data — a vendor's
 * name, "15.60€", "ETA: 12 mins", a delivery code — is never here.
 */
const orders = {
  // ── The list ─────────────────────────────────────────────────────────────
  title: "My Orders",
  subtitle: "Everything you have ordered, and where each one is.",
  tabAll: "All",
  tabOngoing: "Ongoing",
  tabComplete: "Complete",
  tabCancelled: "Cancelled",
  track: "Track Order",
  details: "Details",
  reorder: "Reorder",
  orderImage: "Order photograph",
  emptyTitle: "No orders here yet",
  emptyBody: "Orders you place show up here, with their status and receipts.",

  // ── The tracker ──────────────────────────────────────────────────────────
  trackerLabel: "Order progress",
  stepConfirmed: "Confirmed",
  stepKitchen: "Kitchen",
  stepPacked: "Packed",
  stepReady: "Ready for pickup",
  stepCollected: "Collected",

  // ── The detail ───────────────────────────────────────────────────────────
  riderTitle: "Your rider",
  riderImage: "Rider photograph",
  deliveryCode: "Delivery code",
  deliveryCodeBody: "Give this code to the rider when your order arrives.",
  cancel: "Cancel order",
  invoice: "Download invoice",
  writeReview: "Write a review",

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
  notificationsAll: "All",
  notificationsUnread: "{count} unread",
  notificationImage: "Notification illustration",
  notificationsEmpty: "Nothing new",
  notificationsEmptyBody:
    "Updates about your orders, rides and deliveries arrive here.",

  // ── The two nothings ─────────────────────────────────────────────────────
  unavailableTitle: "Your orders are not connected yet",
  unavailableBody:
    "This screen is built; the orders behind it are connected in a later phase. Nothing here is placeholder data — there is simply nothing to show until there is.",
  notificationsUnavailable: "Notifications are not connected yet",
  notificationsUnavailableBody:
    "This screen is built; the notifications behind it are connected in a later phase.",
  notWired:
    "This is not connected yet. The control is real and the request it would send arrives in a later phase — nothing was cancelled, reordered or submitted.",
} satisfies Record<string, string>;

export default orders;
