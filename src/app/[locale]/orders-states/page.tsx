import { notFound } from "next/navigation";
import { NotificationList, OrderDetail, OrderList } from "@/features/orders";
import { TranslationProvider } from "@/i18n/TranslationProvider";
import { getLocale } from "@/i18n/server";
import { loadNamespace } from "@/i18n/namespaces";
import { withLocale } from "@/lib/i18n/path";
import { ROUTES } from "@/lib/routes";
import type { Messages } from "@/lib/i18n/translate";
import {
  CANCELLED_ORDER,
  FINISHED_ORDER,
  LIVE_ORDER,
  NOTIFICATIONS_FIXTURE,
  ORDERS_FIXTURE,
  PICKUP_ORDER,
} from "./fixture";
import { detailCopy, listCopy, notificationCopy } from "./copy";

/**
 * The order screens, populated. **Development only; 404s in production**, like
 * `/tokens`, `/primitives`, `/formats`, `/auth-states`, `/food-states`,
 * `/cart-states` and `/checkout-states`.
 *
 * The list, four order details (a live delivery with its code, a pickup
 * ready at the counter, a delivered order still to rate, a cancelled one with
 * its refund), and the notifications page. **Offline**: every write refuses
 * with `previewOnly`, since the views are the live ones.
 */
export default async function OrdersStatesPage() {
  if (process.env.NODE_ENV === "production") notFound();

  const locale = await getLocale();
  const [orders, cart, common, nav] = await Promise.all([
    loadNamespace(locale, "orders"),
    loadNamespace(locale, "cart"),
    loadNamespace(locale, "common"),
    loadNamespace(locale, "nav"),
  ]);
  // Interpolating here as well, so the development page exercises the same
  // resolved strings the routes produce rather than raw patterns.
  const lookup =
    (m: Messages) => (k: string, values?: Record<string, string | number>) =>
      Object.entries(values ?? {}).reduce(
        (out, [name, value]) => out.replace(`{${name}}`, String(value)),
        m[k] ?? k,
      );
  const t = lookup(orders);
  const c = lookup(cart);
  const cartHref = withLocale(ROUTES.cart.path, locale);
  const offline = t("previewOnly");

  return (
    <TranslationProvider locale={locale} messages={{ common, orders, cart, nav }}>
      <div className="flex flex-col gap-16 py-8">
        <OrderList
          orders={ORDERS_FIXTURE}
          locale={locale}
          copy={listCopy(t)}
          offlineNotice={offline}
        />
        {[LIVE_ORDER, PICKUP_ORDER, FINISHED_ORDER, CANCELLED_ORDER].map((order) => (
          <OrderDetail
            key={order.id}
            order={order}
            cartHref={cartHref}
            supportHref="#"
            locale={locale}
            ordersHref="#"
            copy={detailCopy(t, c, order.rider?.name)}
            offlineNotice={offline}
          />
        ))}
        <NotificationList
          groups={NOTIFICATIONS_FIXTURE}
          copy={notificationCopy(t, c, 1)}
          offlineNotice={offline}
        />
      </div>
    </TranslationProvider>
  );
}
