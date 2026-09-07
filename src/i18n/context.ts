"use client";
/**
 * The channel from the server to client components: the active locale, and the
 * message objects the server chose to send.
 *
 * `messages` is `Partial` on purpose. A client component can only translate a
 * namespace the server actually passed down, and asking for one it did not is
 * an error with a fix in it (`useTranslation` says which layout to add it to)
 * rather than a page of untranslated keys.
 */
import { createContext } from "react";
import type { Locale } from "@/lib/i18n/locale";
import type { Messages } from "@/lib/i18n/translate";
import type { Namespace } from "./namespaces";

export type TranslationContextValue = {
  locale: Locale;
  messages: Partial<Record<Namespace, Messages>>;
};

export const TranslationContext = createContext<TranslationContextValue | null>(null);
