import type { Metadata } from "next";
import {
  OrderList,
  OrdersUnavailableError,
  notWiredOrders,
  type Order,
  type OrderListCopy,
} from "@/features/orders";
import { getLocale, getTranslations } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("orders");
  return { title: t("title") };
}

/** `/account/orders` — every order in four tabs. The transport rejects in
 *  Track B, so the page says so; the populated design is `/orders-states`. */
export default async function OrdersPage() {
  const [t, locale] = await Promise.all([getTranslations("orders"), getLocale()]);

  let orders: readonly Order[] = [];
  let unavailable = false;
  try {
    orders = await notWiredOrders.list();
  } catch (error) {
    if (!(error instanceof OrdersUnavailableError)) throw error;
    unavailable = true;
  }

  const copy: OrderListCopy = {
    title: t("title"),
    subtitle: t("subtitle"),
    tab: {
      all: t("tabAll"),
      ongoing: t("tabOngoing"),
      complete: t("tabComplete"),
      cancelled: t("tabCancelled"),
    },
    track: t("track"),
    details: t("details"),
    reorder: t("reorder"),
    orderImage: t("orderImage"),
    emptyTitle: t("emptyTitle"),
    emptyBody: t("emptyBody"),
    unavailableTitle: t("unavailableTitle"),
    unavailableBody: t("unavailableBody"),
    notWired: t("notWired"),
  };

  return (
    <OrderList orders={orders} locale={locale} copy={copy} unavailable={unavailable} />
  );
}
