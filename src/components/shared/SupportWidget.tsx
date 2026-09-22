"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { SUPPORT_EVENT, type SupportIntent } from "@/lib/events";
import type { Locale } from "@/lib/i18n/locale";
import { hasSession, subscribeSession } from "@/services/session/state";

/**
 * Every string the panel renders, resolved on the server by
 * `services/support/copy`. Its own namespace, because these are the strings
 * that ship on every page.
 */
export type SupportPanelCopy = {
  launcher: string;
  title: string;
  subtitle: string;
  ticket: string;
  you: string;
  team: string;
  placeholder: string;
  send: string;
  attachment: string;
  loading: string;
  failed: string;
  retry: string;
  sendFailed: string;
  openFull: string;
  topicsTitle: string;
  topicsHint: string;
  sectionOrders: string;
  sectionPayments: string;
  sectionAccount: string;
  prefillOrderIssue: string;
  prefillPayment: string;
  prefillAccount: string;
  topicOrderLate: string;
  topicOrderWrong: string;
  topicRefundStatus: string;
  topicUnrecognizedCharge: string;
  topicPaymentMethods: string;
  topicRequestInvoice: string;
  topicAccountAccess: string;
  topicAppProblem: string;
};

/**
 * The conversation itself loads on the first press.
 *
 * `ssr: false` because it renders over whatever page is already there — there
 * is no server render of it to hydrate — and because the alternative is every
 * route in the app paying for a dialog, a textarea and a transport that most
 * visits never open. Same arrangement as `LocationModal` and the store details
 * dialog, both of which were measured at 6–8% of the route budget when they
 * were imported statically.
 */
const SupportDialog = dynamic(
  () => import("./SupportDialog").then((module) => module.SupportDialog),
  { ssr: false },
);

/**
 * Support, from any page (Phase 20h).
 *
 * The old app mounts its chat panel in the `(main)` layout so that asking a
 * question never costs the page you were on: a customer stuck in checkout asks
 * from checkout. This is the same arrangement — mounted once in the locale
 * layout, opened by a floating button or by {@link SUPPORT_EVENT} from
 * anywhere, and it never navigates.
 *
 * ## It renders nothing for a guest
 *
 * Every support endpoint needs a token. A launcher that opens a dialog that
 * can only say "sign in first" is a button that lies, so guests get no button
 * — and an opener that fires anyway sends them to sign in, with the page they
 * were on to come back to.
 *
 * ## And it costs no requests until it is pressed
 *
 * The button is on every page and reads nothing: no ticket list, no unread
 * count. The count the old app shows lives on its help-centre row, which
 * already holds the profile that `unreadCount` has to be keyed by; that is
 * Phase 20i's, not every page's.
 */
export function SupportWidget({
  locale,
  fullHref,
  loginHref,
  copy,
  closeLabel,
}: {
  locale: Locale;
  /** `/account/support` — the same conversation, in full. */
  fullHref: string;
  loginHref: string;
  copy: SupportPanelCopy;
  closeLabel: string;
}) {
  const router = useRouter();
  const [signedIn, setSignedIn] = useState(false);
  const [open, setOpen] = useState(false);
  /**
   * The topic to open with, and a counter that changes on every opening.
   *
   * The counter is the dialog's `key`: a second opener pressed while the panel
   * is already open replaces the conversation's draft wholesale — the way the
   * old app's store replaces its intent rather than merging it — instead of
   * appending a topic to a half-written message.
   */
  const [intent, setIntent] = useState<{ prefill?: string; seq: number }>({ seq: 0 });

  useEffect(() => {
    const read = () => setSignedIn(hasSession());
    read();
    return subscribeSession(read);
  }, []);

  useEffect(() => {
    const onOpen = (event: Event) => {
      const detail = (event as CustomEvent<SupportIntent>).detail;
      if (!hasSession()) {
        router.push(loginHref);
        return;
      }
      setIntent((current) => ({
        prefill: detail?.prefill ?? undefined,
        seq: current.seq + 1,
      }));
      setOpen(true);
    };
    window.addEventListener(SUPPORT_EVENT, onOpen);
    return () => window.removeEventListener(SUPPORT_EVENT, onOpen);
  }, [router, loginHref]);

  if (!signedIn) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIntent((current) => ({ prefill: undefined, seq: current.seq + 1 }));
          setOpen(true);
        }}
        aria-label={copy.launcher}
        /* Bottom-end, clear of the push toast above it (Phase 20g), and below
           the dialog overlay's own layer. Focus is the app's one global
           `:focus-visible` outline — a ring of its own here would be the
           forty-fifth component to decide it knew better. */
        className="bg-brand text-ink-inverse fixed end-4 bottom-4 z-30 flex size-12 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105"
      >
        <Icon name="chat" className="size-6" />
      </button>

      {/* Mounted only once opened, so the chunk is fetched on the press and a
          closed panel keeps no poll running. */}
      {open ? (
        <SupportDialog
          key={intent.seq}
          open={open}
          onOpenChange={setOpen}
          initialPrefill={intent.prefill}
          locale={locale}
          fullHref={fullHref}
          copy={copy}
          closeLabel={closeLabel}
        />
      ) : null}
    </>
  );
}
