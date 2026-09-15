import type { Metadata } from "next";
import { AccountShell } from "@/components/layout/AccountShell";
import { accountNav } from "@/components/layout/accountNav";
import {
  NotificationList,
  type NotificationGroup,
  type Order,
} from "@/features/orders";
import { getLocale, getTranslations } from "@/i18n/server";
import { withLocale } from "@/lib/i18n/path";
import { ROUTES } from "@/lib/routes";
import { accountNavLabels } from "@/services/account/copy";
import { notificationListCopy } from "@/services/orders/copy";
import { readNotifications, readOrders } from "@/services/orders/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("orders");
  return { title: t("notificationsTitle") };
}

/** `/notifications` — grouped by day, beside the live order's summary
 *  (Phase 19). The two reads fail separately. */
export default async function NotificationsPage() {
  const [notificationRead, orderRead] = await Promise.allSettled([
    readNotifications(),
    readOrders(),
  ]);
  const groups: NotificationGroup[] =
    notificationRead.status === "fulfilled" ? notificationRead.value : [];
  const orders: Order[] = orderRead.status === "fulfilled" ? orderRead.value : [];

  // Counted on the server, where `Intl.PluralRules` lives.
  const unread = groups.flatMap((g) => g.notifications).filter((n) => n.unread).length;

  const [copy, locale, labels, account] = await Promise.all([
    notificationListCopy(unread),
    getLocale(),
    accountNavLabels(),
    getTranslations("account"),
  ]);

  const live = orders.find((order) => order.bucket === "ongoing");

  return (
    <AccountShell
      title={copy.title}
      subtitle={copy.subtitle}
      nav={accountNav(locale, labels)}
      activeId="notifications"
      navLabel={account("navLabel")}
    >
      <NotificationList
        groups={groups}
        activeOrder={
          live?.store
            ? {
                store: live.store,
                reference: live.reference,
                status: live.statusLabel,
                href: withLocale(
                  ROUTES.order.path.replace("[orderId]", encodeURIComponent(live.id)),
                  locale,
                ),
              }
            : undefined
        }
        copy={copy}
        unavailable={notificationRead.status === "rejected"}
        framed
      />
    </AccountShell>
  );
}
