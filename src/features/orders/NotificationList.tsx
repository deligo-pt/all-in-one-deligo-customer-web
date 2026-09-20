"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon, type IconName } from "@/components/ui/Icon";
import type { NotificationKind } from "@/lib/orders";
import { ordersApi } from "./api";
import type { NotificationGroup } from "./types";

export type NotificationCopy = {
  title: string;
  subtitle: string;
  /** "3 unread", counted on the server. Absent when there are none. */
  unread?: string;
  markAllRead: string;
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
 * link. One column: this page is the notifications, and nothing else.
 *
 * **The design's vertical filter row is not drawn**: every notification the
 * API sends is `type: ORDER` with no vertical (measured on 102), so the row
 * would hold one chip. Opening a notification's order marks it read; "Mark all
 * as read" is shown only while something is unread.
 */
/** The glyph each kind of notification wears, so the row says what it is
 *  about before it is read. */
const KIND_ICON: Record<NotificationKind, IconName> = {
  order: "shop",
  offer: "tag",
  security: "key",
  general: "notification",
};

export function NotificationList({
  groups,
  copy,
  unavailable = false,
  offlineNotice,
  framed = false,
}: {
  groups: readonly NotificationGroup[];
  copy: NotificationCopy;
  /** The list could not be read — different from having none. */
  unavailable?: boolean;
  /** Set on the states page: every write refuses with this sentence. */
  offlineNotice?: string;
  /** Rendered inside the account frame, which is narrower. */
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

      {/* One column. The order summary that used to sit beside this list is
          gone (Phase 20h fix): a page called Notifications was showing a cart
          -shaped panel of an order nobody had asked about, and the customer's
          reading column was half the width because of it. The orders screen
          is one click away in the menu beside it. */}
      <div className="flex flex-col gap-8">
        <div className="flex min-w-0 flex-col gap-8">
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
                  {group.notifications.map((item) => {
                    const body = (
                      <>
                        <span
                          aria-hidden
                          className={[
                            "flex size-11 shrink-0 items-center justify-center rounded-full",
                            item.unread
                              ? "bg-surface text-brand"
                              : "bg-surface-muted text-ink-muted",
                          ].join(" ")}
                        >
                          <Icon
                            name={KIND_ICON[item.kind] ?? "notification"}
                            className="size-5"
                          />
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col gap-1">
                          <span className="text-16 text-ink-strong font-semibold">
                            {item.title}
                          </span>
                          <span className="text-14 text-ink-warm">{item.body}</span>
                          <span className="text-12 text-ink-muted font-medium">
                            {item.when}
                          </span>
                        </span>
                        {item.unread ? (
                          <span
                            aria-hidden
                            className="bg-brand mt-2 size-2 shrink-0 rounded-full"
                          />
                        ) : null}
                      </>
                    );
                    const shell = [
                      "rounded-16 flex w-full gap-4 border p-5 text-start transition-colors",
                      item.unread
                        ? "border-brand-soft bg-brand-tint"
                        : "border-line bg-surface",
                    ].join(" ");
                    return (
                      <li key={item.id}>
                        {/* The whole row is the link where there is somewhere to
                            go — the old app's behaviour, and the target a thumb
                            actually aims at. Opening it marks it read. */}
                        {item.action ? (
                          <Link
                            href={item.action.href}
                            aria-label={`${item.title} — ${item.action.label}`}
                            onClick={() => {
                              if (item.unread && !offlineNotice)
                                void ordersApi.markRead(item.id).catch(() => {});
                            }}
                            className={`${shell} hover:border-brand`}
                          >
                            {body}
                          </Link>
                        ) : (
                          <div className={shell}>{body}</div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
