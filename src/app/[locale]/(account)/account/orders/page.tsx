import type { Metadata } from "next";
import { AccountShell } from "@/components/layout/AccountShell";
import { accountNav } from "@/components/layout/accountNav";
import { OrderList, type Order } from "@/features/orders";
import { getLocale, getTranslations } from "@/i18n/server";
import { accountNavLabels } from "@/services/account/copy";
import { orderListCopy } from "@/services/orders/copy";
import { readOrders } from "@/services/orders/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("orders");
  return { title: t("title") };
}

/** `/account/orders` — every order on the account, in four tabs (Phase 19),
 *  inside the account frame so the menu stays where the customer left it. */
export default async function OrdersPage() {
  const [copy, locale, labels, account] = await Promise.all([
    orderListCopy(),
    getLocale(),
    accountNavLabels(),
    getTranslations("account"),
  ]);

  let orders: Order[] = [];
  let unavailable = false;
  try {
    orders = await readOrders();
  } catch {
    unavailable = true;
  }

  return (
    <AccountShell
      title={copy.title}
      subtitle={copy.subtitle}
      nav={accountNav(locale, labels)}
      activeId="orders"
      navLabel={account("navLabel")}
    >
      <OrderList
        orders={orders}
        locale={locale}
        copy={copy}
        unavailable={unavailable}
        framed
      />
    </AccountShell>
  );
}
