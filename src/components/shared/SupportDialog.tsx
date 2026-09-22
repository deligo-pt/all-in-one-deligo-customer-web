"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import type { Locale } from "@/lib/i18n/locale";
import { SUPPORT_SECTIONS, buildTopicPrefill, normalizeOutgoingMessage } from "@/lib/support";
import {
  markRead,
  readThread,
  sendMessage,
  type SupportThreadView,
} from "@/services/support/browser";
import type { SupportPanelCopy } from "./SupportWidget";

/** How often an open conversation re-reads itself. The old app polled at 10 s. */
const REFRESH_MS = 10_000;
const MESSAGE_MAX = 2000;

/**
 * The support conversation, over whatever page it was opened from (Phase 20h).
 *
 * Loaded on the first press — see `services/support/browser` for why nothing is
 * requested before that — and never rendered on the server: it can open on any
 * route, including one that was statically generated.
 *
 * ## The topic picker is the point
 *
 * A customer who writes nothing writes nothing, so the empty thread opens with
 * the three pickers from `lib/support`. Choosing one types the old app's own
 * sentence — `Payment Question: Unrecognized Charge` — into the composer and
 * leaves it editable. **Nothing is sent until Send is pressed.** The topic's id
 * never leaves the browser: the API's `category` is write-once and is ignored
 * on every conversation after the first, so the sentence is the only part of
 * "which topic did they pick" that reaches a person.
 */
export function SupportDialog({
  open,
  onOpenChange,
  initialPrefill,
  locale,
  fullHref,
  copy,
  closeLabel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * A sentence an opener asked for, already translated. Read once, when the
   * panel opens: the widget remounts this component per intent, so a second
   * topic replaces the first wholesale rather than being merged into a
   * half-written message.
   */
  initialPrefill?: string;
  locale: Locale;
  /** `/account/support`, for the conversation in full. */
  fullHref: string;
  copy: SupportPanelCopy;
  closeLabel: string;
}) {
  const [thread, setThread] = useState<SupportThreadView | null>(null);
  const [failed, setFailed] = useState(false);
  const [draft, setDraft] = useState(initialPrefill ?? "");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const list = useRef<HTMLDivElement>(null);
  const marked = useRef<string | null>(null);

  // Written as a promise with its callbacks rather than `await` in an effect:
  // state set inside a callback is state set when something outside React
  // answered, which is what an effect is for. `await` puts the same assignment
  // in the effect's own body, where the compiler correctly objects to it.
  const load = useCallback(
    () =>
      readThread(locale).then(
        (next) => {
          setThread(next);
          setFailed(false);
          // Opening the conversation is reading it — once per ticket, not on
          // every ten-second poll.
          if (next.ticketId && marked.current !== next.ticketId) {
            marked.current = next.ticketId;
            void markRead(next.ticketId).catch(() => undefined);
          }
        },
        () => setFailed(true),
      ),
    [locale],
  );

  useEffect(() => {
    if (!open) return;
    void load();
    const timer = setInterval(() => void load(), REFRESH_MS);
    return () => clearInterval(timer);
  }, [open, load]);

  useEffect(() => {
    // The thread scrolls, not the dialog.
    if (list.current) list.current.scrollTop = list.current.scrollHeight;
  }, [thread?.messages.length]);

  async function send() {
    setBusy(true);
    setNotice(null);
    try {
      if (await sendMessage(draft)) {
        setDraft("");
        await load();
      }
    } catch {
      setNotice(copy.sendFailed);
    } finally {
      setBusy(false);
    }
  }

  const empty = !failed && thread !== null && thread.messages.length === 0;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={copy.title}
      description={thread?.ticketId ? `${copy.ticket} ${thread.ticketId}` : copy.subtitle}
      closeLabel={closeLabel}
      className="p-6 sm:p-8"
    >
      <div className="flex flex-col gap-4">
        <div
          ref={list}
          className="flex max-h-[22rem] min-h-40 flex-col gap-3 overflow-y-auto"
        >
          {failed ? (
            <div className="flex flex-col items-start gap-3 py-6">
              <p className="text-14 text-ink-muted">{copy.failed}</p>
              <Button variant="secondary" size="sm" onClick={() => void load()}>
                {copy.retry}
              </Button>
            </div>
          ) : thread === null ? (
            <p className="text-14 text-ink-muted flex items-center gap-2 py-6">
              <Spinner className="size-4" />
              {copy.loading}
            </p>
          ) : empty ? (
            <TopicPicker copy={copy} onPick={setDraft} />
          ) : (
            thread.messages.map((message) => (
              <div
                key={message.id}
                className={[
                  "rounded-16 flex max-w-[85%] flex-col gap-1 px-4 py-3",
                  message.mine
                    ? "bg-brand text-ink-inverse self-end"
                    : "bg-surface-muted text-ink self-start",
                ].join(" ")}
              >
                <span className="text-12 font-semibold opacity-80">
                  {message.mine ? copy.you : copy.team}
                </span>
                <p className="text-14 break-words whitespace-pre-wrap">{message.text}</p>
                {message.attachments.map((url) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-12 underline"
                  >
                    {copy.attachment}
                  </a>
                ))}
                <span className="text-12 self-end opacity-70">{message.time}</span>
              </div>
            ))
          )}
        </div>

        <div className="flex flex-col gap-3">
          <textarea
            rows={3}
            maxLength={MESSAGE_MAX}
            value={draft}
            disabled={busy}
            onChange={(event) => setDraft(event.target.value)}
            aria-label={copy.placeholder}
            placeholder={copy.placeholder}
            className="border-line rounded-12 bg-surface-muted text-14 text-ink w-full resize-none border p-3"
          />
          <p role="status" className="text-14 text-danger empty:hidden">
            {notice}
          </p>
          <div className="flex items-center justify-between gap-3">
            <Link
              href={fullHref}
              onClick={() => onOpenChange(false)}
              className="text-14 text-ink-muted hover:text-ink underline"
            >
              {copy.openFull}
            </Link>
            {/* Live exactly when there is something to say — the same rule the
                transport applies, so the two can never disagree. */}
            <Button
              disabled={busy || normalizeOutgoingMessage(draft) === null}
              onClick={() => void send()}
            >
              {copy.send}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

/** The three pickers. Icons are resolved here; `lib/support` stays free of React. */
function TopicPicker({
  copy,
  onPick,
}: {
  copy: SupportPanelCopy;
  onPick: (sentence: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4 py-1">
      <div className="flex flex-col gap-1">
        <p className="text-14 text-ink-strong font-semibold">{copy.topicsTitle}</p>
        <p className="text-12 text-ink-muted">{copy.topicsHint}</p>
      </div>
      {SUPPORT_SECTIONS.map((section) => (
        <div key={section.id} className="flex flex-col gap-2">
          <p className="text-12 text-ink-warm font-semibold uppercase">
            {copy[section.titleKey as keyof SupportPanelCopy]}
          </p>
          <div className="flex flex-wrap gap-2">
            {section.topics.map((topic) => {
              const label = copy[topic.labelKey as keyof SupportPanelCopy];
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() =>
                    onPick(
                      buildTopicPrefill(
                        copy[section.prefillKey as keyof SupportPanelCopy],
                        label,
                      ) ?? "",
                    )
                  }
                  className="border-line rounded-12 text-14 text-ink hover:border-brand hover:text-brand inline-flex items-center gap-2 border px-3 py-2 transition-colors"
                >
                  <Icon name={topic.icon as IconName} className="size-4" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
