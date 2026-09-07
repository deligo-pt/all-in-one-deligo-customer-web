"use client";
/**
 * Carries the active locale and a chosen set of messages across the
 * server/client boundary.
 *
 * What crosses is data, not code: the dictionaries stay on the server and only
 * the resolved objects are serialised into the RSC payload. A namespace nothing
 * on the client uses therefore costs the browser nothing, which is the property
 * that lets Plan.md §6 keep a first-load budget while shipping two languages.
 *
 * Mounted once, in the `[locale]` layout, with the namespaces that are genuinely
 * app-wide. A route that needs more mounts a second provider closer to the
 * components that need them.
 */
import type { ReactNode } from "react";
import type { Locale } from "@/lib/i18n/locale";
import type { Messages } from "@/lib/i18n/translate";
import type { Namespace } from "./namespaces";
import { TranslationContext } from "./context";

export function TranslationProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Partial<Record<Namespace, Messages>>;
  children: ReactNode;
}) {
  return (
    <TranslationContext.Provider value={{ locale, messages }}>
      {children}
    </TranslationContext.Provider>
  );
}
