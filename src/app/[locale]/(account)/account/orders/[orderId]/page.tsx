import type { Metadata } from "next";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { OrderDetail, type Order } from "@/features/orders";
import { getLocale, getTranslations } from "@/i18n/server";
import { withLocale } from "@/lib/i18n/path";
import { ROUTES } from "@/lib/routes";
import { orderDetailCopy } from "@/services/orders/copy";
import { readOrder } from "@/services/orders/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ orderId: string }>;
}): Promise<Metadata> {
  const [{ orderId }, t] = await Promise.all([params, getTranslations("orders")]);
  return { title: `${t("title")} · ${decodeURIComponent(orderId)}` };
}

/**
 * `/account/orders/[orderId]` — one order (Phase 19).
 *
 * An order the API does not know is "not found"; an API that cannot be reached
 * is "could not be loaded". Two sentences, because only the first means the
 * customer has the wrong link.
 */
export default async function OrderPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const [{ orderId }, t, locale] = await Promise.all([
    params,
    getTranslations("orders"),
    getLocale(),
  ]);

  let order: Order | null = null;
  let unavailable = false;
  try {
    order = await readOrder(decodeURIComponent(orderId));
  } catch {
    unavailable = true;
  }

  if (!order) {
    return (
      <div className="max-w-shell mx-auto w-full px-8 py-16">
        <EmptyState
          icon={<Icon name="clock" className="size-8" />}
          title={unavailable ? t("unavailableTitle") : t("notFoundTitle")}
          description={unavailable ? t("unavailableBody") : t("notFoundBody")}
        />
      </div>
    );
  }

  return (
    <OrderDetail
      order={order}
      cartHref={withLocale(ROUTES.cart.path, locale)}
      supportHref={withLocale(ROUTES.support.path, locale)}
      ordersHref={withLocale(ROUTES.orders.path, locale)}
      copy={await orderDetailCopy(order.rider?.name)}
    />
  );
}
