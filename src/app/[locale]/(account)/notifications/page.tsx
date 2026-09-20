import type { Metadata } from "next";
import { AccountShell } from "@/components/layout/AccountShell";
import { accountNav } from "@/components/layout/accountNav";
import { NotificationList, type NotificationGroup } from "@/features/orders";
import { getLocale, getTranslations } from "@/i18n/server";
import { accountNavLabels } from "@/services/account/copy";
import { notificationListCopy } from "@/services/orders/copy";
import { readNotifications } from "@/services/orders/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("orders");
  return { title: t("notificationsTitle") };
}

/** `/notifications` — the customer's notifications, grouped by day (Phase 19;
 *  the live order's summary that used to sit beside them was removed in Phase
 *  20h — this page is the notifications, and the orders screen is one click
 *  away in the menu). */
export default async function NotificationsPage() {
  const notificationRead = await readNotifications().catch(() => null);
  const groups: NotificationGroup[] = notificationRead ?? [];

  // Counted on the server, where `Intl.PluralRules` lives.
  const unread = groups.flatMap((g) => g.notifications).filter((n) => n.unread).length;

  const [copy, locale, labels, account] = await Promise.all([
    notificationListCopy(unread),
    getLocale(),
    accountNavLabels(),
    getTranslations("account"),
  ]);

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
        copy={copy}
        unavailable={notificationRead === null}
        framed
      />
    </AccountShell>
  );
}
