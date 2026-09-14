"use client";

import { useContext, useEffect, useState } from "react";
import { DrawerClose, Drawer } from "@/components/ui/Drawer";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";
import { Logo } from "./Logo";
import { AuthPanel } from "@/features/auth";
import { TranslationContext } from "@/i18n/context";
import { TranslationProvider } from "@/i18n/TranslationProvider";
import { loadNamespace } from "@/i18n/namespaces";
import type { Messages } from "@/lib/i18n/translate";

/**
 * The design's sign-in panel: an edge drawer over whatever page you were on.
 *
 * **The drawer is the header's composition, not the feature's.** An earlier
 * version of this put it inside `features/auth` and exported it beside
 * `AuthPanel`, which meant `/login` — a page that renders the panel and no
 * drawer at all — still received the Radix Dialog behind it, because a
 * feature's barrel hands every importer every export. Wrapping the panel here
 * costs nothing and keeps each route paying only for what it renders. Measured
 * at 9.3 KB gzipped on `/login`.
 *
 * **Its strings are fetched when it opens, not sent with the page.** The button
 * that opens this sits in the header of every route, so anything it needs
 * eagerly is paid for by every route — including the ones nobody signs in from.
 * `loadNamespace` is a static map of `import()` calls, so the `auth` dictionary
 * is one chunk per language that arrives on the first open and is cached after.
 * The alternative, mounting `auth` in the locale layout beside `common`, would
 * serialise every string on this panel into the payload of every page in the
 * application.
 *
 * The messages are merged into the surrounding context rather than replacing
 * it: a nested provider is the whole context for its subtree, and `common` is
 * needed in here too — the device-limit dialog's close button, for one.
 */
export function SignInDrawer({
  open,
  onOpenChange,
  title,
  description,
  closeLabel,
  appName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  closeLabel: string;
  /** For the wordmark in the drawer's own header. */
  appName: string;
}) {
  const outer = useContext(TranslationContext);
  const [messages, setMessages] = useState<Messages | null>(null);

  useEffect(() => {
    if (!outer) return;
    let live = true;
    void loadNamespace(outer.locale, "auth").then((loaded) => {
      if (live) setMessages(loaded);
    });
    return () => {
      live = false;
    };
  }, [outer]);

  if (!outer) return null;

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      side="end"
      title={title}
      description={description}
      closeLabel={closeLabel}
      // Measured from the four auth frames: a 704px panel, rounded 16 on the
      // leading edge only, with a 110px header bar above a 1px rule — the
      // wordmark at one end and a bare pink cross at the other, 48px in from
      // each. Below `sm` it takes the whole viewport, which the design does
      // not draw (D-8).
      className="w-[min(44rem,100vw)] rounded-s-16"
      header={
        <div className="border-line flex h-[6.875rem] shrink-0 items-center justify-between border-b px-12">
          <Logo locale={outer.locale} label={appName} />
          <DrawerClose
            aria-label={closeLabel}
            className="text-brand hover:text-brand-strong transition-colors"
          >
            <Icon name="close" className="size-6" />
          </DrawerClose>
        </div>
      }
    >
      <div className="px-8 py-16 sm:px-12">
        {messages ? (
          <TranslationProvider
            locale={outer.locale}
            messages={{ ...outer.messages, auth: messages }}
          >
            <AuthPanel onSignedIn={() => onOpenChange(false)} />
          </TranslationProvider>
        ) : (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        )}
      </div>
    </Drawer>
  );
}
