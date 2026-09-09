import type { Metadata } from "next";
import {
  CheckoutUnavailableError,
  CheckoutView,
  notWiredCheckout,
  type Checkout,
  type CheckoutCopy,
  type DeliveryDay,
  type Voucher,
} from "@/features/checkout";
import { getLocale, getTranslations } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("checkout");
  return { title: t("title") };
}

/**
 * `/checkout` — the last screen before money moves.
 *
 * A Server Component that reads the checkout, its vouchers and its delivery
 * windows, and hands one client view the result. Three separate reads because
 * they fail separately: a cart that cannot be read is a broken page, while
 * vouchers that cannot be listed is a sheet that says so and a checkout that
 * still works. `Promise.allSettled` rather than `all` for exactly that reason
 * — one rejection must not take the other two down.
 *
 * In Track B all three reject, so the page renders its unavailable state while
 * every card, dialog and control beneath it is built and operable. The
 * populated design is at `/checkout-states`.
 */
export default async function CheckoutPage() {
  // Three namespaces, because the screen is made of three things. Its own
  // words; the dish modal's instruction placeholder, which the design repeats
  // verbatim; and the cart's summary panel, which this route renders whole —
  // the panel's copy belongs with the panel, not copied into a second
  // dictionary that could drift from it.
  const [t, cart, food, locale] = await Promise.all([
    getTranslations("checkout"),
    getTranslations("cart"),
    getTranslations("food"),
    getLocale(),
  ]);

  const [read, voucherRead, slotRead] = await Promise.allSettled([
    notWiredCheckout.read(),
    notWiredCheckout.listVouchers(),
    notWiredCheckout.listSlots(),
  ]);

  const settled = <T,>(
    result: PromiseSettledResult<T>,
  ): { value: T | null; unavailable: boolean } => {
    if (result.status === "fulfilled")
      return { value: result.value, unavailable: false };
    if (result.reason instanceof CheckoutUnavailableError)
      return { value: null, unavailable: true };
    throw result.reason;
  };

  const checkout = settled<Checkout>(read);
  const vouchers = settled<readonly Voucher[]>(voucherRead);
  const slots = settled<readonly DeliveryDay[]>(slotRead);

  const copy: CheckoutCopy = {
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
      // The design repeats the dish modal's sentence verbatim, so this reads
      // the `food` namespace rather than keeping a second copy of it that a
      // translator could change in one place and not the other.
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

  return (
    <CheckoutView
      checkout={checkout.value}
      vouchers={vouchers.value ?? []}
      days={slots.value ?? []}
      locale={locale}
      copy={copy}
      unavailable={checkout.unavailable}
      vouchersUnavailable={vouchers.unavailable}
      slotsUnavailable={slots.unavailable}
    />
  );
}
