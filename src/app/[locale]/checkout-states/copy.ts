import type { CheckoutCopy } from "@/features/checkout";

/**
 * The checkout view's copy, built from the `checkout`, `cart` and `food`
 * dictionaries.
 *
 * Three, because the screen is made of three things: its own words, the cart's
 * summary panel which it renders whole, and the dish modal's instruction
 * placeholder which the design repeats verbatim. The development page loads
 * all three itself, so `t` is passed in rather than `@/i18n/server` being
 * imported here — this file needs no request context.
 *
 * It exists so the fixture is reviewed against the strings customers will
 * read. A states page with wording of its own proves the layout and nothing
 * about the copy.
 */
export function checkoutCopy(
  t: (key: string) => string,
  cart: (key: string) => string,
  food: (key: string) => string,
): CheckoutCopy {
  return {
    title: t("title"),
    schedule: {
      label: t("scheduleLabel"),
      change: t("scheduleChange"),
      choose: t("scheduleChoose"),
      chooseBody: t("scheduleChooseBody"),
    },
    delivery: {
      title: t("deliveryTitle"),
      edit: t("deliveryEdit"),
      noAddress: t("deliveryNoAddress"),
      mapAlt: t("deliveryMapAlt"),
      instructionTitle: t("instructionTitle"),
      instructionPlaceholder: food("specialInstructionsPlaceholder"),
    },
    payment: {
      title: t("paymentTitle"),
      showAll: t("paymentShowAll"),
      showLess: t("paymentShowLess"),
      methodName: {
        mbway: t("methodMbway"),
        card: t("methodCard"),
        "apple-pay": t("methodApplePay"),
        paypal: t("methodPaypal"),
        "google-pay": t("methodGooglePay"),
        other: t("methodOther"),
      },
      methodDescription: {
        mbway: t("methodMbwayBody"),
        card: t("methodCardBody"),
        "apple-pay": t("methodApplePayBody"),
        paypal: t("methodPaypalBody"),
        "google-pay": t("methodGooglePayBody"),
        other: t("methodOtherBody"),
      },
      cardNumber: t("cardNumber"),
      cardNumberPlaceholder: t("cardNumberPlaceholder"),
      cardHolder: t("cardHolder"),
      cardHolderPlaceholder: t("cardHolderPlaceholder"),
      cardExpiry: t("cardExpiry"),
      cardExpiryPlaceholder: t("cardExpiryPlaceholder"),
      cardCvv: t("cardCvv"),
      cardCvvPlaceholder: t("cardCvvPlaceholder"),
      cardNotice: t("cardNotice"),
    },
    tip: { title: t("tipTitle"), later: t("tipLater"), tipLabel: t("tipLabel") },
    summary: {
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
    },
    location: {
      title: t("locationTitle"),
      body: t("locationBody"),
      close: t("scheduleChange"),
      addressLabel: t("locationAddressLabel"),
      addressPlaceholder: t("locationAddressPlaceholder"),
      locateMe: t("locationLocateMe"),
      confirm: t("locationConfirm"),
      mapAlt: t("deliveryMapAlt"),
      notWired: t("notWired"),
    },
    voucher: {
      title: t("voucherTitle"),
      close: t("scheduleChange"),
      codeLabel: t("voucherCodeLabel"),
      codePlaceholder: t("voucherCodePlaceholder"),
      apply: t("voucherApply"),
      applied: t("voucherApplied"),
      terms: t("voucherTerms"),
      emptyTitle: t("voucherEmpty"),
      emptyBody: t("voucherEmptyBody"),
      unavailableTitle: t("voucherUnavailable"),
      unavailableBody: t("voucherUnavailableBody"),
    },
    scheduleModal: {
      title: t("scheduleTitle"),
      body: t("scheduleBody"),
      close: t("scheduleChange"),
      yourDelivery: t("scheduleYourDelivery"),
      recommended: t("scheduleRecommended"),
      emptyTitle: t("scheduleEmpty"),
      emptyBody: t("scheduleEmptyBody"),
      unavailableTitle: t("scheduleUnavailable"),
      unavailableBody: t("scheduleUnavailableBody"),
    },
    confirmed: {
      title: t("confirmedTitle"),
      body: t("confirmedBody"),
      close: t("scheduleChange"),
      reference: t("confirmedReference"),
      delivery: t("confirmedDelivery"),
      payment: t("confirmedPayment"),
      total: t("confirmedTotal"),
      stayUpdated: t("confirmedStayUpdated"),
      stayUpdatedBody: t("confirmedStayUpdatedBody"),
      backHome: t("confirmedBackHome"),
    },
    unavailableTitle: t("unavailableTitle"),
    unavailableBody: t("unavailableBody"),
    notWired: t("notWired"),
  };
}
