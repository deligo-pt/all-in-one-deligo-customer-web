"use client";

import Link from "next/link";
import { useState } from "react";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { ImageSlot } from "@/components/shared/ImageSlot";
import { OrderSummary, type SummaryCopy } from "@/features/cart";
import type { CartStore } from "@/features/cart";
import type { NotificationGroup } from "./types";

export type NotificationCopy = {
  title: string;
  subtitle: string;
  all: string;
  /** "3 unread", already pluralised and counted on the server. Absent when
   *  there are none. */
  unread?: string;
  summary: SummaryCopy;
  notificationImage: string;
  emptyTitle: string;
  emptyBody: string;
  unavailableTitle: string;
  unavailableBody: string;
  notWired: string;
};

/**
 * `/notifications` — 1440×1802.
 *
 * Measured: the title at 32/600 over 16/400 in `ink-warm`, an unread pill, a
 * row of vertical filters, then day groups — "TODAY", "YESTERDAY" at 14/500 —
 * of 897×128 cards at 16px radius with a 64px thumbnail, the title at 18/600,
 * the body at 16/400, a timestamp at 12/600 and one action link. The live
 * order's summary panel sits on the right.
 *
 * **The vertical filters are derived from what has arrived**, not declared —
 * the same rule the cart's tabs follow. A `Ride (0)` chip on an account that
 * has never booked one is a control that can only disappoint.
 *
 * **Each card's action comes from the notification**, never from its type. The
 * other project decided the action from the notification's `type` and offered
 * "Track Order" on delivered orders, sending people to a page with nothing on
 * it.
 */
export function NotificationList({
  groups,
  verticals,
  activeOrder,
  browseHref,
  copy,
  unavailable = false,
}: {
  groups: readonly NotificationGroup[];
  /** Label and count per vertical, resolved on the server — plurals belong
   *  with `Intl.PluralRules`, not in the browser. */
  verticals: readonly { id: string; label: string }[];
  activeOrder?: CartStore;
  browseHref: string;
  copy: NotificationCopy;
  unavailable?: boolean;
}) {
  const [vertical, setVertical] = useState<string>("all");
  const [notice, setNotice] = useState<string | null>(null);

  const visible = groups
    .map((group) => ({
      ...group,
      notifications:
        vertical === "all"
          ? group.notifications
          : group.notifications.filter((n) => n.vertical === vertical),
    }))
    .filter((group) => group.notifications.length > 0);

  return (
    <div className="max-w-shell mx-auto flex w-full flex-col gap-8 px-8 py-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-32 text-ink font-semibold">{copy.title}</h1>
          <p className="text-16 text-ink-warm">{copy.subtitle}</p>
        </div>
        {copy.unread ? (
          <p className="bg-brand-tint text-brand text-20 rounded-full px-6 py-3 font-semibold">
            {copy.unread}
          </p>
        ) : null}
      </header>

      {verticals.length > 1 ? (
        <div className="flex flex-wrap gap-4" role="group" aria-label={copy.title}>
          {verticals.map((entry) => (
            <Chip
              key={entry.id}
              selected={vertical === entry.id}
              onClick={() => setVertical(entry.id)}
            >
              {entry.label}
            </Chip>
          ))}
        </div>
      ) : null}

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-8">
          {unavailable ? (
            <EmptyState
              icon={<Icon name="notification" className="size-8" />}
              title={copy.unavailableTitle}
              description={copy.unavailableBody}
            />
          ) : visible.length === 0 ? (
            <EmptyState
              icon={<Icon name="notification" className="size-8" />}
              title={copy.emptyTitle}
              description={copy.emptyBody}
            />
          ) : (
            visible.map((group) => (
              <section key={group.id} className="flex flex-col gap-4">
                <h2 className="text-14 text-ink-warm font-medium tracking-wide uppercase">
                  {group.label}
                </h2>
                <ul className="flex flex-col gap-3">
                  {group.notifications.map((item) => (
                    <li
                      key={item.id}
                      className={[
                        "rounded-16 flex gap-4 border p-5",
                        item.unread
                          ? "border-brand-soft bg-brand-tint"
                          : "border-line bg-surface",
                      ].join(" ")}
                    >
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
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
                              className="text-14 text-brand-strong font-medium underline-offset-4 hover:underline"
                            >
                              {item.action.label}
                            </Link>
                          ) : null}
                        </div>
                      </div>
                      <ImageSlot
                        src={item.image}
                        alt={copy.notificationImage}
                        sizes="64px"
                        className="rounded-12 size-16 shrink-0"
                      />
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
              <OrderSummary
                store={activeOrder}
                copy={copy.summary}
                browseHref={browseHref}
                onApplyVoucher={() => setNotice(copy.notWired)}
                onPlaceOrder={() => setNotice(copy.notWired)}
              />
              <p role="status" className="text-14 text-ink-muted mt-3">
                {notice}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
