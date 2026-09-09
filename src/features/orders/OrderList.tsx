"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import type { Locale } from "@/lib/i18n/locale";
import { withLocale } from "@/lib/i18n/path";
import { ROUTES } from "@/lib/routes";
import { OrderCard, type OrderCardCopy } from "./OrderCard";
import { notWiredOrders } from "./transport";
import type { Order, OrderBucket } from "./types";

type Tab = "all" | OrderBucket;
const TABS: readonly Tab[] = ["all", "ongoing", "complete", "cancelled"];

export type OrderListCopy = OrderCardCopy & {
  title: string;
  subtitle: string;
  tab: Record<Tab, string>;
  emptyTitle: string;
  emptyBody: string;
  unavailableTitle: string;
  unavailableBody: string;
  notWired: string;
};

/**
 * `/account/orders` — every order, in four tabs.
 *
 * The tabs are `All · Ongoing · Complete · Cancelled`, and the filter runs off
 * `order.bucket` — one field the API decides. The other project built this
 * from two independent status allowlists and every status in neither was
 * fetched, held in memory and rendered nowhere; the customer searched their
 * own order id and got "no results". One field, four tabs, no gaps.
 */
export function OrderList({
  orders,
  locale,
  copy,
  unavailable = false,
}: {
  orders: readonly Order[];
  locale: Locale;
  copy: OrderListCopy;
  unavailable?: boolean;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("all");
  const [notice, setNotice] = useState<string | null>(null);

  const visible = tab === "all" ? orders : orders.filter((o) => o.bucket === tab);

  async function reorder(orderId: string) {
    setNotice(null);
    try {
      await notWiredOrders.reorder(orderId);
      router.refresh();
    } catch {
      setNotice(copy.notWired);
    }
  }

  return (
    <div className="max-w-shell mx-auto flex w-full flex-col gap-8 px-8 py-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-32 text-ink font-semibold">{copy.title}</h1>
        <p className="text-16 text-ink-warm">{copy.subtitle}</p>
      </header>

      <div className="flex flex-wrap gap-4" role="group" aria-label={copy.title}>
        {TABS.map((name) => (
          <Chip key={name} selected={tab === name} onClick={() => setTab(name)}>
            {copy.tab[name]}
          </Chip>
        ))}
      </div>

      {unavailable ? (
        <EmptyState
          icon={<Icon name="clock" className="size-8" />}
          title={copy.unavailableTitle}
          description={copy.unavailableBody}
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<Icon name="clock" className="size-8" />}
          title={copy.emptyTitle}
          description={copy.emptyBody}
        />
      ) : (
        <ul className="flex flex-col gap-4">
          {visible.map((order) => (
            <li key={order.id}>
              <OrderCard
                order={order}
                copy={copy}
                onReorder={reorder}
                detailHref={withLocale(
                  ROUTES.order.path.replace("[orderId]", order.id),
                  locale,
                )}
              />
            </li>
          ))}
        </ul>
      )}

      <p role="status" className="text-14 text-ink-muted">
        {notice}
      </p>
    </div>
  );
}
