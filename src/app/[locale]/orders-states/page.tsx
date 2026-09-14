import { notFound } from "next/navigation";
import { NotificationList, OrderDetail, OrderList } from "@/features/orders";
import { TranslationProvider } from "@/i18n/TranslationProvider";
import { getLocale } from "@/i18n/server";
import { loadNamespace } from "@/i18n/namespaces";
import { withLocale } from "@/lib/i18n/path";
import { ROUTES } from "@/lib/routes";
import type { Messages } from "@/lib/i18n/translate";
import {
  ACTIVE_STORE,
  FINISHED_ORDER,
  GROCERY_ORDER,
  LIVE_ORDER,
  NOTIFICATIONS_FIXTURE,
  ORDERS_FIXTURE,
} from "./fixture";
import { detailCopy, listCopy, notificationCopy } from "./copy";

/**
 * The order screens, populated. **Development only; 404s in production**, like
 * `/tokens`, `/primitives`, `/formats`, `/auth-states`, `/food-states`,
 * `/cart-states` and `/checkout-states`.
 *
 * Four instances: the list, a live order (tracker, rider, delivery code,
 * cancel), a finished one (reorder, review, invoice), and the notifications
 * page with its day groups and vertical filters.
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
  const home = withLocale(ROUTES.food.path, locale);

  return (
    <TranslationProvider locale={locale} messages={{ common, orders, cart, nav }}>
      <div className="flex flex-col gap-16 py-8">
        <OrderList orders={ORDERS_FIXTURE} locale={locale} copy={listCopy(t)} />
        <OrderDetail
          order={LIVE_ORDER}
          homeHref={home}
          copy={detailCopy(t, c, LIVE_ORDER.rider?.name)}
        />
        <OrderDetail
          order={GROCERY_ORDER}
          homeHref={home}
          copy={detailCopy(t, c, GROCERY_ORDER.rider?.name)}
        />
        <OrderDetail
          order={FINISHED_ORDER}
          homeHref={home}
          copy={detailCopy(t, c, FINISHED_ORDER.rider?.name)}
        />
        <NotificationList
          groups={NOTIFICATIONS_FIXTURE}
          verticals={[
            { id: "all", label: t("notificationsAll") },
            { id: "food", label: lookup(nav)("food") },
            { id: "ride", label: lookup(nav)("ride") },
            { id: "parcel", label: lookup(nav)("parcel") },
            { id: "electronics", label: lookup(nav)("electronics") },
          ]}
          activeOrder={ACTIVE_STORE}
          browseHref={home}
          copy={notificationCopy(t, c, 1)}
        />
      </div>
    </TranslationProvider>
  );
}
