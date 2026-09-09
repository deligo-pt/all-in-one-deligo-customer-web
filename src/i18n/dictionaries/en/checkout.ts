/**
 * The checkout screen's words.
 *
 * Its own namespace: two routes render these and the other seventy do not.
 *
 * Copy is transcribed from the five `add pizza` frames and their three
 * dialogs. Where a string names data rather than chrome — an address, a
 * voucher code, a time window, "30.97€" — it is **not** here; those arrive
 * from the API exactly as sent (Plan.md §2.2). The payment methods are named
 * here because which methods DeliGo offers is a product decision drawn in the
 * design, the same way the sign-in panel's three providers were in Phase 6.
 *
 * `instructionPlaceholder` is deliberately **not** a new string: the design
 * repeats the dish modal's sentence verbatim, so the checkout route reads it
 * from the `food` namespace rather than keeping a second copy that a
 * translator could change in one place and not the other.
 */
const checkout = {
  title: "Checkout",

  // ── The scheduled window ─────────────────────────────────────────────────
  scheduleLabel: "Scheduled delivery",
  scheduleChange: "Change",
  scheduleChoose: "Choose a delivery time",
  scheduleChooseBody:
    "Pick a window that suits you, or leave it and we deliver as soon as we can.",

  // ── Delivery details ─────────────────────────────────────────────────────
  deliveryTitle: "Delivery details",
  deliveryEdit: "Edit",
  deliveryNoAddress: "No delivery address yet",
  deliveryMapAlt: "Map of the delivery address",
  instructionTitle: "Delivery Instruction",

  // ── Payment ──────────────────────────────────────────────────────────────
  paymentTitle: "Payment Method",
  paymentShowAll: "Show all",
  paymentShowLess: "Show less",
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

  cardNumber: "Card Number",
  cardNumberPlaceholder: "0000 0000 0000 0000",
  cardHolder: "Cardholder Name",
  cardHolderPlaceholder: "Enter name as on card",
  cardExpiry: "Expiry Date",
  cardExpiryPlaceholder: "MM/YY",
  cardCvv: "CVV",
  cardCvvPlaceholder: "••••••",
  // Why the four fields above are inert. Card details belong to the payment
  // provider; putting a real card number through this application would put it
  // in PCI scope for no benefit. See D-14.
  cardNotice:
    "Card details are entered on the payment provider's own secure form, which arrives in a later phase. These fields collect nothing.",

  // ── The tip ──────────────────────────────────────────────────────────────
  tipTitle: "Tip Your Rider",
  tipLater: "Later",
  tipLabel: "Tip",

  // ── The location dialog ──────────────────────────────────────────────────
  locationTitle: "Select your exact location",
  locationBody: "We'll show restaurants near you",
  locationAddressLabel: "Delivery address",
  locationAddressPlaceholder: "Enter your address",
  locationLocateMe: "Locate me",
  locationConfirm: "Confirm Location",

  // ── The voucher sheet ────────────────────────────────────────────────────
  voucherTitle: "Apply a voucher",
  voucherCodeLabel: "Voucher code",
  voucherCodePlaceholder: "Enter voucher code",
  voucherApply: "Apply",
  voucherApplied: "Applied",
  voucherTerms: "Terms & Conditions",
  voucherEmpty: "No vouchers available",
  voucherEmptyBody:
    "You have no vouchers on this account right now. A code can still be entered above.",
  voucherUnavailable: "Vouchers are not available yet",
  voucherUnavailableBody:
    "This sheet is built; the vouchers behind it are connected in a later phase. Nothing here is placeholder data.",

  // ── The Smart Delivery dialog ────────────────────────────────────────────
  scheduleTitle: "Smart Delivery",
  scheduleBody: "Choose when it arrives",
  scheduleYourDelivery: "Your delivery",
  scheduleRecommended: "Recommended:",
  scheduleEmpty: "No delivery windows",
  scheduleEmptyBody: "There is nothing to book for this store right now.",
  scheduleUnavailable: "Delivery windows are not available yet",
  scheduleUnavailableBody:
    "This picker is built; the windows behind it are connected in a later phase.",

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

  // ── The two nothings ─────────────────────────────────────────────────────
  unavailableTitle: "Checkout is not connected yet",
  unavailableBody:
    "This screen is built; the order and payment endpoints behind it are connected in a later phase. Nothing here is placeholder data — there is simply nothing to check out until there is.",
  notWired:
    "Checkout is not connected yet. This control is real and the request it would send arrives in a later phase — no order was placed and nothing was charged.",
} satisfies Record<string, string>;

export default checkout;
