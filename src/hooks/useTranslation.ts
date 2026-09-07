"use client";
/**
 * Translation for Client Components.
 *
 * Server Components should use `getTranslations` from `@/i18n/server` instead —
 * it needs no provider, and its strings never reach the browser as a
 * dictionary. This hook exists for the leaves that genuinely run in the
 * browser: a switcher, a modal, a form.
 *
 * Both errors below are thrown rather than silently absorbed. The alternative —
 * falling back to the key, or to the default locale — is what turns a wiring
 * mistake into a page of raw identifiers that renders fine in review and wrong
 * in production.
 */
import { useContext, useMemo } from "react";
import { DEFAULT_LOCALE } from "@/lib/i18n/locale";
import type { Messages } from "@/lib/i18n/translate";
import { TranslationContext } from "@/i18n/context";
import { createTranslator, type Translator } from "@/i18n/translator";
import type { Namespace } from "@/i18n/namespaces";

const NO_MESSAGES: Messages = Object.freeze({});

export function useTranslation<N extends Namespace>(namespace: N) {
  const context = useContext(TranslationContext);

  // Every hook runs unconditionally; the assertions come after. Throwing from
  // inside the `useMemo` would work but makes the hook order depend on state
  // that is allowed to be missing.
  const locale = context?.locale ?? DEFAULT_LOCALE;
  const messages = context?.messages[namespace];
  const t = useMemo(
    () => createTranslator<N>(locale, messages ?? NO_MESSAGES),
    [locale, messages],
  );

  if (!context) {
    throw new Error(
      "useTranslation was called outside <TranslationProvider>. The provider is mounted in the [locale] layout — a component rendering above it has no locale to translate into.",
    );
  }
  if (!messages) {
    throw new Error(
      `useTranslation("${namespace}") was called but the "${namespace}" namespace was not sent to the client. Add it to the <TranslationProvider> in the nearest server layout or page: messages={{ ${namespace}: await loadNamespace(locale, "${namespace}") }}.`,
    );
  }

  return { t, locale: context.locale } as { t: Translator<N>; locale: typeof locale };
}
