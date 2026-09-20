"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { accountApi } from "./api";
import { AccountShell, type AccountNavItem } from "@/components/layout/AccountShell";
import type { SupportThread } from "./types";

/** How often an open thread re-reads itself. The old app polled at 10 s. */
const THREAD_REFRESH_MS = 10_000;
const MESSAGE_MAX = 2000;

export type SupportCopy = {
  title: string;
  subtitle: string;
  navLabel: string;
  ticket: string;
  emptyTitle: string;
  emptyBody: string;
  unavailableTitle: string;
  unavailableBody: string;
  you: string;
  team: string;
  placeholder: string;
  send: string;
  attachment: string;
  actionFailed: string;
};

/**
 * `/account/support` — chat with DeliGo support (Phase 20).
 *
 * The API keeps one open ticket per customer: `POST /support/send-message`
 * joins it or opens one (measured), and there is no endpoint to choose a
 * ticket. The thread re-reads every 10 seconds while the page is open and
 * after every send; opening it marks the customer's unread messages read.
 * `?message=` pre-fills the composer (the account-deletion request uses it).
 */
export function SupportView({
  thread,
  nav,
  initialMessage = "",
  orderRecordId,
  copy,
  unavailable = false,
  offlineNotice,
}: {
  thread: SupportThread;
  nav: readonly AccountNavItem[];
  initialMessage?: string;
  /** The order a "Report an issue" came from; sent with the first message. */
  orderRecordId?: string;
  copy: SupportCopy;
  unavailable?: boolean;
  offlineNotice?: string;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState(initialMessage.slice(0, MESSAGE_MAX));
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const list = useRef<HTMLDivElement>(null);
  const marked = useRef(false);

  useEffect(() => {
    if (offlineNotice || unavailable) return;
    const timer = setInterval(() => router.refresh(), THREAD_REFRESH_MS);
    return () => clearInterval(timer);
  }, [offlineNotice, unavailable, router]);

  useEffect(() => {
    if (offlineNotice || marked.current || !thread.ticketId || thread.unread === 0)
      return;
    marked.current = true;
    void accountApi.markSupportRead(thread.ticketId).catch(() => undefined);
  }, [offlineNotice, thread.ticketId, thread.unread]);

  useEffect(() => {
    // The list scrolls, not the page.
    if (list.current) list.current.scrollTop = list.current.scrollHeight;
  }, [thread.messages.length]);

  async function send() {
    if (offlineNotice) return setNotice(offlineNotice);
    setBusy(true);
    setNotice(null);
    try {
      await accountApi.sendSupport(draft, orderRecordId);
      setDraft("");
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
    <AccountShell
      title={copy.title}
      subtitle={copy.subtitle}
      nav={nav}
      activeId="support"
      navLabel={copy.navLabel}
    >
      <section className="border-line rounded-16 bg-surface flex flex-col border">
        {thread.ticketId ? (
          <p className="border-line text-14 text-ink-muted border-b px-5 py-3">
            {[`${copy.ticket} ${thread.ticketId}`, thread.status]
              .filter(Boolean)
              .join(" · ")}
          </p>
        ) : null}

        <div
          ref={list}
          className="flex max-h-[32rem] min-h-64 flex-col gap-3 overflow-y-auto p-5"
        >
          {unavailable ? (
            <EmptyState
              icon={<Icon name="alert" className="size-8" />}
              title={copy.unavailableTitle}
              description={copy.unavailableBody}
            />
          ) : thread.messages.length === 0 ? (
            <EmptyState
              icon={<Icon name="email" className="size-8" />}
              title={copy.emptyTitle}
              description={copy.emptyBody}
            />
          ) : (
            thread.messages.map((message, index) => {
              const showDay =
                index === 0 || thread.messages[index - 1]!.day !== message.day;
              return (
                <div key={message.id} className="flex flex-col gap-2">
                  {showDay ? (
                    <p className="text-12 text-ink-warm self-center font-semibold uppercase">
                      {message.day}
                    </p>
                  ) : null}
                  <div
                    className={[
                      "rounded-16 flex max-w-[80%] flex-col gap-1 px-4 py-3",
                      message.mine
                        ? "bg-brand text-ink-inverse self-end"
                        : "bg-surface-muted text-ink self-start",
                    ].join(" ")}
                  >
                    <span className="text-12 font-semibold opacity-80">
                      {message.mine ? copy.you : copy.team}
                    </span>
                    <p className="text-16 break-words whitespace-pre-wrap">
                      {message.text}
                    </p>
                    {message.attachments.map((url) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-14 underline"
                      >
                        {copy.attachment}
                      </a>
                    ))}
                    <span className="text-12 self-end opacity-70">{message.time}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="border-line flex flex-col gap-3 border-t p-4">
          <textarea
            rows={3}
            maxLength={MESSAGE_MAX}
            value={draft}
            disabled={busy || unavailable}
            onChange={(event) => setDraft(event.target.value)}
            aria-label={copy.placeholder}
            placeholder={copy.placeholder}
            className="border-line rounded-12 bg-surface-muted text-16 text-ink w-full resize-none border p-3"
          />
          <p role="status" className="text-14 text-danger empty:hidden">
            {notice}
          </p>
          <Button
            className="self-end"
            disabled={busy || unavailable || !draft.trim()}
            onClick={send}
          >
            {copy.send}
          </Button>
        </div>
      </section>
    </AccountShell>
  );
}
