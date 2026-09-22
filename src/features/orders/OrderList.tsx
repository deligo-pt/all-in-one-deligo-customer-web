"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import type { Locale } from "@/lib/i18n/locale";
import { withLocale } from "@/lib/i18n/path";
import { matchesSearch } from "@/lib/orders";
import { ROUTES } from "@/lib/routes";
import { ordersApi } from "./api";
import { OrderCard, type OrderCardCopy } from "./OrderCard";
import type { Order, OrderBucket } from "./types";

type Tab = "all" | OrderBucket;
const TABS: readonly Tab[] = ["all", "ongoing", "complete", "cancelled"];

export type OrderListCopy = OrderCardCopy & {
  title: string;
  subtitle: string;
  tab: Record<Tab, string>;
  searchLabel: string;
  searchPlaceholder: string;
  noMatchTitle: string;
  noMatchBody: string;
  emptyTitle: string;
  emptyBody: string;
  unavailableTitle: string;
  unavailableBody: string;
  actionFailed: string;
};

/**
 * `/account/orders` — every order, in four tabs, with a search.
 *
 * The tabs filter on `order.bucket`, one total rule in `lib/orders.ts`, so
 * every status the API sends lands in a tab. The search runs over reference,
 * store and items here because the API's `searchTerm` matches the order id
 * only (measured). Reorder puts the items back in the cart and opens it.
 */
export function OrderList({
  orders,
  locale,
  copy,
  unavailable = false,
  offlineNotice,
  framed = false,
}: {
  orders: readonly Order[];
  locale: Locale;
  copy: OrderListCopy;
  unavailable?: boolean;
  /** Set on the states page: every write refuses with this sentence. */
  offlineNotice?: string;
  /** Inside the account frame, which draws the title and the menu. */
  framed?: boolean;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("all");
  const [term, setTerm] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const inTab = tab === "all" ? orders : orders.filter((o) => o.bucket === tab);
  const visible = term.trim()
    ? inTab.filter((o) => matchesSearch(o.searchText, term))
    : inTab;

  async function reorder(orderId: string) {
    if (offlineNotice) return setNotice(offlineNotice);
    setBusy(true);
    setNotice(null);
    try {
      await ordersApi.reorder(orderId);
      router.push(withLocale(ROUTES.cart.path, locale));
    } catch (error) {
      setNotice(
        error instanceof Error && error.message ? error.message : copy.actionFailed,
      );
      setBusy(false);
    }
  }

  return (
    <div
      className={
        framed
          ? "flex w-full flex-col gap-8"
          : "max-w-shell mx-auto flex w-full flex-col gap-8 px-4 sm:px-8 py-8"
      }
    >
      {framed ? null : (
        <header className="flex flex-col gap-2">
          <h1 className="text-32 text-ink font-semibold">{copy.title}</h1>
          <p className="text-16 text-ink-warm">{copy.subtitle}</p>
        </header>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-4" role="group" aria-label={copy.title}>
          {TABS.map((name) => (
            <Chip key={name} selected={tab === name} onClick={() => setTab(name)}>
              {copy.tab[name]}
            </Chip>
          ))}
        </div>
        <div className="w-full sm:w-80">
          <Input
            type="search"
            aria-label={copy.searchLabel}
            placeholder={copy.searchPlaceholder}
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            startIcon={<Icon name="search" className="size-4" />}
          />
        </div>
      </div>

      <p role="status" className="text-14 text-danger empty:hidden">
        {notice}
      </p>

      {unavailable ? (
        <EmptyState
          icon={<Icon name="clock" className="size-8" />}
          title={copy.unavailableTitle}
          description={copy.unavailableBody}
        />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<Icon name="clock" className="size-8" />}
          title={copy.emptyTitle}
          description={copy.emptyBody}
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<Icon name="search" className="size-8" />}
          title={copy.noMatchTitle}
          description={copy.noMatchBody}
        />
      ) : (
        <ul className="flex flex-col gap-4">
          {visible.map((order) => (
            <li key={order.id}>
              <OrderCard
                order={order}
                copy={copy}
                busy={busy}
                onReorder={reorder}
                detailHref={withLocale(
                  ROUTES.order.path.replace("[orderId]", encodeURIComponent(order.id)),
                  locale,
                )}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
