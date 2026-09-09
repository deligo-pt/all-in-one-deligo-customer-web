import type { Metadata } from "next";
import {
  NotificationList,
  OrdersUnavailableError,
  notWiredOrders,
  type NotificationCopy,
  type NotificationGroup,
} from "@/features/orders";
import { getLocale, getTranslations } from "@/i18n/server";
import { withLocale } from "@/lib/i18n/path";
import { ROUTES } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("orders");
  return { title: t("notificationsTitle") };
}

/** `/notifications` — 1440×1802, grouped by day. */
export default async function NotificationsPage() {
  const [t, cart, nav, locale] = await Promise.all([
    getTranslations("orders"),
    getTranslations("cart"),
    getTranslations("nav"),
    getLocale(),
  ]);

  let groups: readonly NotificationGroup[] = [];
  let unavailable = false;
  try {
    groups = await notWiredOrders.notifications();
  } catch (error) {
    if (!(error instanceof OrdersUnavailableError)) throw error;
    unavailable = true;
  }

  // Derived from what has actually arrived, never declared: a `Ride (0)` chip
  // on an account that has never booked one is a control that can only
  // disappoint. Same rule the cart's tabs follow.
  const present = new Set(
    groups.flatMap((g) => g.notifications.map((n) => n.vertical).filter(Boolean)),
  );
  const NAMES: Record<string, string> = {
    food: nav("food"),
    groceries: nav("groceries"),
    ride: nav("ride"),
    hotel: nav("hotel"),
    parcel: nav("parcel"),
    electronics: nav("electronics"),
  };
  const verticals = [
    { id: "all", label: t("notificationsAll") },
    ...[...present].map((id) => ({
      id: String(id),
      label: NAMES[String(id)] ?? String(id),
    })),
  ];

  // Counted on the server, like every other counted string since Phase 9 —
  // `Intl.PluralRules` lives with the translator, not in the browser.
  const unread = groups.reduce(
    (n, group) => n + group.notifications.filter((x) => x.unread).length,
    0,
  );

  const copy: NotificationCopy = {
    title: t("notificationsTitle"),
    subtitle: t("notificationsSubtitle"),
    all: t("notificationsAll"),
    unread: unread > 0 ? t("notificationsUnread", { count: unread }) : undefined,
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
    notificationImage: t("notificationImage"),
    emptyTitle: t("notificationsEmpty"),
    emptyBody: t("notificationsEmptyBody"),
    unavailableTitle: t("notificationsUnavailable"),
    unavailableBody: t("notificationsUnavailableBody"),
    notWired: t("notWired"),
  };

  return (
    <NotificationList
      groups={groups}
      verticals={verticals}
      browseHref={withLocale(ROUTES.food.path, locale)}
      copy={copy}
      unavailable={unavailable}
    />
  );
}
