import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import {
  OrderDetail,
  OrdersUnavailableError,
  notWiredOrders,
  type Order,
  type OrderDetailCopy,
} from "@/features/orders";
import { getLocale, getTranslations } from "@/i18n/server";
import { withLocale } from "@/lib/i18n/path";
import { ROUTES } from "@/lib/routes";

/**
 * `/account/orders/[orderId]` — one order.
 *
 * `notFound()` is deliberately not called for the unavailable case. An order
 * id that does not exist is a 404; a transport that is not connected is not,
 * and answering the second with the first trains everyone to read "order not
 * found" as "not built yet" — right up until a real one goes missing.
 */
export default async function OrderPage() {
  const [t, cart, locale] = await Promise.all([
    getTranslations("orders"),
    getTranslations("cart"),
    getLocale(),
  ]);

  let order: Order | null = null;
  try {
    order = await notWiredOrders.get("");
  } catch (error) {
    if (!(error instanceof OrdersUnavailableError)) throw error;
  }

  if (!order) {
    return (
      <div className="max-w-shell mx-auto w-full px-8 py-16">
        <EmptyState
          icon={<Icon name="clock" className="size-8" />}
          title={t("unavailableTitle")}
          description={t("unavailableBody")}
        />
      </div>
    );
  }

  const copy: OrderDetailCopy = {
    tracker: {
      label: t("trackerLabel"),
      step: {
        confirmed: t("stepConfirmed"),
        kitchen: t("stepKitchen"),
        packed: t("stepPacked"),
        ready: t("stepReady"),
        collected: t("stepCollected"),
      },
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
    review: {
      title: t("reviewTitle"),
      close: t("reviewSkip"),
      status: t("details"),
      overall: t("reviewOverall"),
      thanks: t("reviewThanks"),
      placeholder: t("reviewPlaceholder"),
      // Resolved here, with the values. A pattern handed to the browser
      // renders `{name}` to anyone the substitution misses.
      riderQuestion: t("reviewRider", { name: order.rider?.name ?? "" }),
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

  return (
    <OrderDetail
      order={order}
      homeHref={withLocale(ROUTES.food.path, locale)}
      copy={copy}
    />
  );
}
