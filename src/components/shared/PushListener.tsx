"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { hasSession } from "@/services/session/state";
import type { ForegroundMessage } from "@/services/push/browser";

const SHOWN_MS = 6_000;

/**
 * Foreground push on the account pages (Phase 19): an order update that
 * arrives while the customer is looking re-reads the page — the order's
 * status, the notification list — and says what arrived for a few seconds.
 * Firebase loads only for a signed-in browser that already allowed
 * notifications; everyone else pays nothing.
 */
export function PushListener({ closeLabel }: { closeLabel: string }) {
  const router = useRouter();
  const [message, setMessage] = useState<ForegroundMessage | null>(null);

  useEffect(() => {
    if (!hasSession()) return;
    let stop: (() => void) | undefined;
    let cancelled = false;
    void import("@/services/push/browser")
      .then(({ onForegroundMessage }) =>
        onForegroundMessage((next) => {
          setMessage(next);
          router.refresh();
        }),
      )
      .then((unsubscribe) => {
        if (cancelled) unsubscribe?.();
        else stop = unsubscribe;
      });
    return () => {
      cancelled = true;
      stop?.();
    };
  }, [router]);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), SHOWN_MS);
    return () => clearTimeout(timer);
  }, [message]);

  if (!message?.title && !message?.body) return null;
  return (
    <div
      role="status"
      className="border-line bg-surface rounded-16 fixed end-4 bottom-4 z-50 flex max-w-sm gap-3 border p-4 shadow-lg"
    >
      <div className="flex min-w-0 flex-col gap-1">
        {message.title ? (
          <p className="text-16 text-ink-strong font-semibold">{message.title}</p>
        ) : null}
        {message.body ? <p className="text-14 text-ink-warm">{message.body}</p> : null}
      </div>
      <button
        type="button"
        aria-label={closeLabel}
        className="text-ink-muted self-start"
        onClick={() => setMessage(null)}
      >
        ×
      </button>
    </div>
  );
}
