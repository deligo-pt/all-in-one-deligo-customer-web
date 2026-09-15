import type { CheckoutCopy } from "@/features/checkout";
import type { OutcomeCopy } from "@/features/payment";

/**
 * The checkout view's copy for the development states page, built from the
 * `checkout`, `cart` and `food` dictionaries — the same keys `/checkout`
 * reads, so the fixture is reviewed against the strings customers will read.
 */
export function checkoutCopy(
  t: (key: string) => string,
  cart: (key: string) => string,
  food: (key: string) => string,
): CheckoutCopy {
  return {
    title: t("title"),
    fulfilment: {
      title: t("fulfilmentTitle"),
      delivery: t("fulfilmentDelivery"),
      deliveryBody: t("fulfilmentDeliveryBody"),
      pickup: t("fulfilmentPickup"),
      pickupBody: t("fulfilmentPickupBody"),
      pickupUnavailable: t("pickupUnavailable"),
      pickupFrom: t("pickupFrom"),
      pickupTime: t("pickupTimeLabel"),
      pickupChange: t("pickupChange"),
    },
    pickup: {
      title: t("pickupTitle"),
      body: t("pickupBody"),
      close: t("confirmedClose"),
      today: t("pickupToday"),
      tomorrow: t("pickupTomorrow"),
      noSlots: t("pickupNoSlots"),
      confirm: t("pickupConfirm"),
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
      savedCards: t("savedCards"),
      newCard: t("newCard"),
      saveCard: t("saveCard"),
      saveCardBody: t("saveCardBody"),
      gatewayNotice: t("gatewayNotice"),
      instantNotice: t("instantNotice"),
    },
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
    payNow: t("payNow"),
    address: {
      title: t("addressTitle"),
      body: t("addressBody"),
      close: t("confirmedClose"),
      active: t("addressActive"),
      emptyTitle: t("addressEmpty"),
      emptyBody: t("addressEmptyBody"),
    },
    voucher: {
      title: t("voucherTitle"),
      close: t("confirmedClose"),
      codeLabel: t("voucherCodeLabel"),
      codePlaceholder: t("voucherCodePlaceholder"),
      apply: t("voucherApply"),
      applied: t("voucherApplied"),
      remove: t("voucherRemove"),
      emptyTitle: t("voucherEmpty"),
      emptyBody: t("voucherEmptyBody"),
      unavailableTitle: t("voucherUnavailable"),
      unavailableBody: t("voucherUnavailableBody"),
    },
    chooseMethod: t("chooseMethod"),
    actionFailed: t("actionFailed"),
  };
}

export function outcomeCopy(t: (key: string) => string): OutcomeCopy {
  return {
    finishing: t("returnFinishing"),
    failedTitle: t("returnFailedTitle"),
    failedBody: t("returnFailedBody"),
    missingTitle: t("returnMissingTitle"),
    missingBody: t("returnMissingBody"),
    retry: t("retry"),
    viewOrders: t("viewOrders"),
    backToCart: t("backToCart"),
    paymentFailedTitle: t("failedTitle"),
    paymentFailedBody: t("failedBody"),
    confirmed: {
      title: t("confirmedTitle"),
      body: t("confirmedBody"),
      close: t("confirmedClose"),
      reference: t("confirmedReference"),
      delivery: t("confirmedDelivery"),
      payment: t("confirmedPayment"),
      total: t("confirmedTotal"),
      stayUpdated: t("confirmedStayUpdated"),
      stayUpdatedBody: t("confirmedStayUpdatedBody"),
      backHome: t("confirmedBackHome"),
    },
  };
}
