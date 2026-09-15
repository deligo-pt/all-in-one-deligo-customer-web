import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import {
  CheckoutStart,
  CheckoutView,
  type Checkout,
  type CheckoutCopy,
  type SavedAddress,
  type SavedCard,
  type Voucher,
} from "@/features/checkout";
import { getLocale, getTranslations } from "@/i18n/server";
import { isCheckoutId } from "@/lib/checkout";
import { withLocale } from "@/lib/i18n/path";
import { hasSlots, pickupDays } from "@/lib/pickup";
import { ROUTES } from "@/lib/routes";
import { readCart } from "@/services/cart/server";
import {
  readAddresses,
  readCheckout,
  readPickupHours,
  readSavedCards,
  readVouchers,
} from "@/services/checkout/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("checkout");
  return { title: t("title") };
}

/**
 * `/checkout` — the last screen before money moves (Phase 18).
 *
 * Without `?id=` the cart's active store is turned into a checkout summary in
 * the browser (`CheckoutStart`), which then lands here with its id. With one,
 * the summary is read on the server alongside its offers, the saved cards and
 * the saved addresses. Those three fail separately — a voucher list that cannot
 * be read is a sheet that says so, not a broken checkout — and a summary that
 * has already become an order goes to its confirmation.
 */
export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string | string[] }>;
}) {
  const [t, cart, food, locale, query] = await Promise.all([
    getTranslations("checkout"),
    getTranslations("cart"),
    getTranslations("food"),
    getLocale(),
    searchParams,
  ]);
  const cartHref = withLocale(ROUTES.cart.path, locale);
  const id = typeof query.id === "string" && isCheckoutId(query.id) ? query.id : null;

  const frame = (title: string, body: string) => (
    <div className="max-w-shell mx-auto w-full px-8 py-16">
      <EmptyState
        icon={<Icon name="cart" className="size-8" />}
        title={title}
        description={body}
        action={
          <Button asChild>
            <Link href={cartHref}>{t("backToCart")}</Link>
          </Button>
        }
      />
    </div>
  );

  if (!id) {
    let hasActiveStore = false;
    try {
      hasActiveStore = Boolean(
        (await readCart())?.stores.some((store) => store.active),
      );
    } catch {
      return frame(t("unavailableTitle"), t("unavailableBody"));
    }
    if (!hasActiveStore) return frame(t("emptyTitle"), t("emptyBody"));
    return (
      <CheckoutStart
        checkoutPath={withLocale(ROUTES.checkout.path, locale)}
        cartHref={cartHref}
        copy={{
          preparing: t("preparing"),
          unavailableTitle: t("unavailableTitle"),
          backToCart: t("backToCart"),
        }}
      />
    );
  }

  let read: Awaited<ReturnType<typeof readCheckout>>;
  try {
    read = await readCheckout(id);
  } catch {
    return frame(t("unavailableTitle"), t("unavailableBody"));
  }
  if ("orderId" in read)
    redirect(
      `${withLocale(ROUTES.paymentSuccess.path, locale)}?order=${encodeURIComponent(read.orderId)}`,
    );
  const checkout: Checkout = read.checkout;

  const [voucherRead, cardRead, addressRead, hoursRead] = await Promise.allSettled([
    readVouchers(id, checkout.voucherCode),
    readSavedCards(),
    readAddresses(),
    readPickupHours(),
  ]);
  const pickupHours = hoursRead.status === "fulfilled" ? hoursRead.value : null;
  const vouchers: Voucher[] =
    voucherRead.status === "fulfilled" ? voucherRead.value : [];
  const cards: SavedCard[] = cardRead.status === "fulfilled" ? cardRead.value : [];
  const addresses: SavedAddress[] =
    addressRead.status === "fulfilled" ? addressRead.value : [];

  const copy: CheckoutCopy = {
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
      // The design repeats the dish modal's sentence verbatim.
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

  return (
    <CheckoutView
      // A new summary is a new screen: nothing chosen for the old one carries over.
      key={checkout.id}
      checkout={checkout}
      vouchers={vouchers}
      vouchersUnavailable={voucherRead.status === "rejected"}
      cards={cards}
      addresses={addresses}
      pickupHours={pickupHours ?? undefined}
      pickupAvailable={pickupHours ? hasSlots(pickupDays(pickupHours)) : false}
      locale={locale}
      copy={copy}
    />
  );
}
