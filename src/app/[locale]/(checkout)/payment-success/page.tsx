import type { Metadata } from "next";
import type { PlacedOrder } from "@/features/checkout";
import { PaymentOutcome } from "@/features/payment";
import { getLocale, getTranslations } from "@/i18n/server";
import { isCheckoutId } from "@/lib/checkout";
import { withLocale } from "@/lib/i18n/path";
import { ROUTES } from "@/lib/routes";
import { outcomeCopy } from "@/services/checkout/copy";
import { readPlacedOrder } from "@/services/checkout/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("checkout");
  return { title: t("confirmedTitle"), robots: { index: false } };
}

/**
 * `/payment-success` — where REDUNIQ returns a paid customer (Phase 18).
 *
 * Arriving from the provider, the order does not exist yet, so the page asks
 * our server to create it and comes back with `?order=`, which renders the
 * design's confirmation from `GET /orders/:orderId`. A checkout id on the
 * return URL (`summaryId`, the old app's name for it) is used when the backend
 * sends one; otherwise the one this browser remembered.
 */
export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [locale, query, copy] = await Promise.all([
    getLocale(),
    searchParams,
    outcomeCopy(),
  ]);
  const links = {
    ordersHref: withLocale(ROUTES.orders.path, locale),
    cartHref: withLocale(ROUTES.cart.path, locale),
    homeHref: withLocale(ROUTES.home.path, locale),
    copy,
  };

  const orderId = typeof query.order === "string" ? query.order : null;
  let order: PlacedOrder | null = null;
  if (orderId && /^[\w-]{1,64}$/.test(orderId)) {
    try {
      order = await readPlacedOrder(orderId);
    } catch {
      order = null;
    }
  }
  if (order) return <PaymentOutcome kind="confirmed" order={order} {...links} />;

  const named = query.summaryId ?? query.checkoutSummaryId;
  return (
    <PaymentOutcome
      kind="finish"
      checkoutId={isCheckoutId(named) ? named : undefined}
      successPath={withLocale(ROUTES.paymentSuccess.path, locale)}
      {...links}
    />
  );
}
