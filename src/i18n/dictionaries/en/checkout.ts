/**
 * The checkout screen's words.
 *
 * Its own namespace: the checkout and the two payment-return pages render
 * these and the other routes do not.
 *
 * Copy is transcribed from the five `add pizza` frames and their dialogs where
 * the design draws it. Where a string names data — an address, a voucher code,
 * an amount — it is **not** here; those arrive from the API exactly as sent
 * (Plan.md §2.2). Placeholders (`{amount}`, `{date}`) are resolved on the
 * server, never in the browser.
 *
 * `instructionPlaceholder` is deliberately **not** a new string: the design
 * repeats the dish modal's sentence verbatim, so it is read from `food`.
 */
const checkout = {
  title: "Checkout",

  // ── Delivery or self-pickup ──────────────────────────────────────────────
  fulfilmentTitle: "How do you want to get it?",
  fulfilmentDelivery: "Delivery",
  fulfilmentDeliveryBody: "A rider brings it to your address",
  fulfilmentPickup: "Self pickup",
  fulfilmentPickupBody: "Collect it from the store, no delivery fee",
  pickupUnavailable: "This store has no pickup times left today",
  pickupFrom: "Collect from",
  pickupTimeLabel: "Pickup time",
  pickupChange: "Change time",
  pickupTitle: "Choose a pickup time",
  pickupBody: "Pick a 30-minute slot. Your order is ready to collect from its start.",
  pickupToday: "Today",
  pickupTomorrow: "Tomorrow",
  pickupNoSlots: "No pickup times left on this day",
  pickupConfirm: "Confirm pickup time",

  // ── Delivery details ─────────────────────────────────────────────────────
  deliveryTitle: "Delivery details",
  deliveryEdit: "Change",
  deliveryNoAddress: "No delivery address yet",
  deliveryMapAlt: "Map of the delivery address",
  deliveryDetail: "{distance} km · {minutes} min",
  instructionTitle: "Delivery Instruction",

  // ── Payment ──────────────────────────────────────────────────────────────
  paymentTitle: "Payment Method",
  paymentShowAll: "Show all",
  methodMbway: "MB WAY",
  methodMbwayBody: "Instant mobile payment (Portugal)",
  methodCard: "Credit/Debit Card",
  methodCardBody: "Visa, Mastercard, Amex",
  methodApplePay: "Apple Pay",
  methodApplePayBody: "Fast secure Apple wallet payment",
  methodPaypal: "PayPal",
  methodPaypalBody: "Pay via PayPal account",
  methodGooglePay: "Google Pay",
  methodGooglePayBody: "Google wallet payment option",
  methodOther: "Other Payment Methods",
  methodOtherBody: "Alternative options",
  savedCards: "Saved cards",
  savedCardExpiry: "Expires {expiry}",
  newCard: "Use another card",
  saveCard: "Save this card",
  saveCardBody:
    "For faster payment next time. The card is kept by the payment provider.",
  gatewayNotice:
    "You finish paying on the payment provider's secure page, then come back here.",
  instantNotice: "This card is charged straight away, with no redirect.",
  chooseMethod: "Choose how you would like to pay first.",
  payNow: "Pay Now",

  // ── The address dialog ───────────────────────────────────────────────────
  addressTitle: "Choose a delivery address",
  addressBody:
    "Checkout delivers to your active address. Choosing another one makes it your active address everywhere.",
  addressActive: "Active",
  addressHome: "Home",
  addressOffice: "Office",
  addressCurrent: "Current location",
  addressOther: "Other",
  addressEmpty: "No saved addresses",
  addressEmptyBody: "Add an address to your account, then come back to checkout.",

  // ── The voucher sheet ────────────────────────────────────────────────────
  voucherTitle: "Apply a voucher",
  voucherCodeLabel: "Voucher code",
  voucherCodePlaceholder: "Enter voucher code",
  voucherApply: "Apply",
  voucherApplied: "Applied",
  voucherRemove: "Remove voucher",
  voucherEmpty: "No vouchers for this order",
  voucherEmptyBody:
    "None of your offers apply to this store right now. A code can still be entered above.",
  voucherUnavailable: "Vouchers could not be loaded",
  voucherUnavailableBody:
    "A code can still be entered above, or try again in a moment.",
  voucherPercent: "{value}% off",
  voucherFlat: "{amount} off",
  voucherBogo: "Buy {buy}, get {get}",
  voucherCap: "up to {amount}",
  voucherMin: "min. order {amount}",
  voucherUntil: "until {date}",

  // ── The summary's VAT captions ───────────────────────────────────────────
  vatIncluded: "incl. VAT {amount}",
  vatAdded: "+ VAT {amount}",

  // ── The confirmation ─────────────────────────────────────────────────────
  confirmedTitle: "Order Confirmed!",
  confirmedBody: "Your order has been placed successfully.",
  confirmedReference: "Order #",
  confirmedDelivery: "Delivery",
  confirmedPayment: "Payment",
  confirmedTotal: "Total",
  confirmedStayUpdated: "Stay updated",
  confirmedStayUpdatedBody:
    "We'll notify you when your order is preparing, out for delivery, and delivered.",
  confirmedBackHome: "Back to Home",
  confirmedClose: "Close",
  paymentPaid: "Paid",

  // ── Returning from the payment provider ──────────────────────────────────
  returnFinishing: "Finishing your order…",
  returnFailedTitle: "Your order was not created",
  returnFailedBody:
    "If your payment went through, try again: the order is created from the checkout, not charged twice.",
  returnMissingTitle: "No payment waiting here",
  returnMissingBody:
    "This browser has no checkout waiting to be paid. Anything already ordered is in your orders.",
  retry: "Try again",
  viewOrders: "View my orders",
  failedTitle: "Payment not completed",
  failedBody: "Nothing was ordered. You can pay again from your cart.",
  backToCart: "Back to cart",

  // ── The nothings, and refusals ───────────────────────────────────────────
  preparing: "Preparing your checkout…",
  emptyTitle: "Nothing to check out",
  emptyBody: "Your cart has no store selected for checkout.",
  unavailableTitle: "Checkout could not be loaded",
  unavailableBody:
    "The order could not be read just now. Nothing was charged; please try again.",
  actionFailed: "That did not go through, and nothing was charged. Please try again.",
  previewOnly: "This is a design preview. Nothing is sent from this page.",
  contactSupport: "Contact support",
} satisfies Record<string, string>;

export default checkout;
