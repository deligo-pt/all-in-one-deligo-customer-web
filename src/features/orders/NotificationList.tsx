"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { OrderSummary, type SummaryCopy } from "@/features/cart";
import type { CartStore } from "@/features/cart";
import { ordersApi } from "./api";
import type { NotificationGroup } from "./types";

export type NotificationCopy = {
  title: string;
  subtitle: string;
  /** "3 unread", counted on the server. Absent when there are none. */
  unread?: string;
  markAllRead: string;
  currentOrder: string;
  trackOrder: string;
  summary: SummaryCopy;
  emptyTitle: string;
  emptyBody: string;
  unavailableTitle: string;
  unavailableBody: string;
  actionFailed: string;
};

/**
 * `/notifications` — 1440×1802.
 *
 * Measured: the title at 32/600 over 16/400 in `ink-warm`, an unread pill,
 * then day groups — "TODAY", "YESTERDAY" at 14/500 — of cards at 16px radius,
 * the title at 18/600, the body at 16/400, a time at 12/600 and one action
 * link. The live order's summary sits on the right.
 *
 * **The design's vertical filter row is not drawn**: every notification the
 * API sends is `type: ORDER` with no vertical (measured on 102), so the row
 * would hold one chip. Opening a notification's order marks it read; "Mark all
 * as read" is shown only while something is unread.
 */
export function NotificationList({
  groups,
  activeOrder,
  copy,
  unavailable = false,
  offlineNotice,
  framed = false,
}: {
  groups: readonly NotificationGroup[];
  /** The latest ongoing order, named and linked. Unlabelled, it reads as a cart. */
  activeOrder?: {
    store: CartStore;
    reference: string;
    status: string;
    href: string;
  };
  copy: NotificationCopy;
  unavailable?: boolean;
  /** Set on the states page: every write refuses with this sentence. */
  offlineNotice?: string;
  /** Inside the account frame, which draws the title and the menu. */
  framed?: boolean;
}) {
  const router = useRouter();
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function markAll() {
    if (offlineNotice) return setNotice(offlineNotice);
    setBusy(true);
    setNotice(null);
    try {
      await ordersApi.markAllRead();
    } catch (error) {
      setNotice(
        error instanceof Error && error.message ? error.message : copy.actionFailed,
      );
    } finally {
      router.refresh();
      setBusy(false);
    }
  }

  return (
    <div
      className={
        framed
          ? "flex w-full flex-col gap-8"
          : "max-w-shell mx-auto flex w-full flex-col gap-8 px-8 py-8"
      }
    >
      <header className="flex flex-wrap items-start justify-between gap-4">
        {framed ? null : (
          <div className="flex flex-col gap-2">
            <h1 className="text-32 text-ink font-semibold">{copy.title}</h1>
            <p className="text-16 text-ink-warm">{copy.subtitle}</p>
          </div>
        )}
        {copy.unread ? (
          <div className="flex flex-wrap items-center gap-4">
            <p className="bg-brand-tint text-brand text-20 rounded-full px-6 py-3 font-semibold">
              {copy.unread}
            </p>
            <Button variant="link" disabled={busy} onClick={markAll}>
              {copy.markAllRead}
            </Button>
          </div>
        ) : null}
      </header>

      <p role="status" className="text-14 text-danger empty:hidden">
        {notice}
      </p>

      <div
        className={
          framed
            ? "flex flex-col gap-8 2xl:flex-row"
            : "flex flex-col gap-8 lg:flex-row"
        }
      >
        <div className="flex min-w-0 flex-1 flex-col gap-8">
          {unavailable ? (
            <EmptyState
              icon={<Icon name="notification" className="size-8" />}
              title={copy.unavailableTitle}
              description={copy.unavailableBody}
            />
          ) : groups.length === 0 ? (
            <EmptyState
              icon={<Icon name="notification" className="size-8" />}
              title={copy.emptyTitle}
              description={copy.emptyBody}
            />
          ) : (
            groups.map((group) => (
              <section key={group.id} className="flex flex-col gap-4">
                <h2 className="text-14 text-ink-warm font-medium tracking-wide uppercase">
                  {group.label}
                </h2>
                <ul className="flex flex-col gap-3">
                  {group.notifications.map((item) => (
                    <li
                      key={item.id}
                      className={[
                        "rounded-16 flex flex-col gap-1 border p-5",
                        item.unread
                          ? "border-brand-soft bg-brand-tint"
                          : "border-line bg-surface",
                      ].join(" ")}
                    >
                      <p className="text-18 text-ink-strong font-semibold">
                        {item.title}
                      </p>
                      <p className="text-16 text-ink-warm">{item.body}</p>
                      <div className="mt-1 flex flex-wrap items-center justify-between gap-4">
                        <span className="text-12 text-ink-warm font-semibold">
                          {item.when}
                        </span>
                        {item.action ? (
                          <Link
                            href={item.action.href}
                            onClick={() => {
                              if (item.unread && !offlineNotice)
                                void ordersApi.markRead(item.id).catch(() => {});
                            }}
                            className="text-14 text-brand-strong font-medium underline-offset-4 hover:underline"
                          >
                            {item.action.label}
                          </Link>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>

        {activeOrder ? (
          <div className="lg:w-104 lg:shrink-0">
            <div className="sticky top-[8rem]">
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-16 text-ink-strong font-semibold">
                      {copy.currentOrder}
                    </h2>
                    <p className="text-14 text-ink-muted">
                      {`${activeOrder.reference} · ${activeOrder.status}`}
                    </p>
                  </div>
                  <Link
                    href={activeOrder.href}
                    className="text-14 text-brand-strong font-semibold underline-offset-4 hover:underline"
                  >
                    {copy.trackOrder}
                  </Link>
                </div>
                <OrderSummary store={activeOrder.store} copy={copy.summary} />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
