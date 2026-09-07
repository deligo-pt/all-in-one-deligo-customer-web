/**
 * Translation for Server Components — the default path.
 *
 * `getTranslations` takes no locale. It reads it from `next/root-params`, which
 * is available to any Server Component because `[locale]` is the segment above
 * the root layout. That removes the alternative, which is threading a `locale`
 * prop through every server component in the tree until someone forgets and
 * hard-codes one.
 *
 * Importing `next/root-params` also makes this module unusable from a Client
 * Component: the import fails at build time there. That is the intended
 * protection, and it is why this file needs no `server-only` dependency.
 * Client components get their strings through `<TranslationProvider>` and
 * `useTranslation` instead.
 */
import { cache } from "react";
import { locale as rootLocale } from "next/root-params";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/locale";
import { loadNamespace, type Namespace } from "./namespaces";
import { createTranslator, type Translator } from "./translator";

/**
 * The active locale, validated.
 *
 * `notFound()` rather than a fallback: a request for `/de/cart` is a request
 * for a page that does not exist, and quietly serving it in Portuguese would
 * mean two URLs for one page and a language the customer did not ask for.
 * `dynamicParams = false` on the layout means this should be unreachable — it
 * is here because "should be unreachable" is not the same as "is".
 */
export const getLocale = cache(async (): Promise<Locale> => {
  const value = await rootLocale();
  if (!isLocale(value)) notFound();
  return value;
});

/** The messages for one namespace in the active locale. `cache` keeps a render
 *  that asks twice from loading twice. */
export const getMessages = cache(async (namespace: Namespace) => {
  return loadNamespace(await getLocale(), namespace);
});

/**
 * `const t = await getTranslations("common")`.
 *
 * The namespace is a literal, so `t` only accepts keys that namespace defines
 * and `verify:i18n` can tell — from the source alone — which keys a file uses.
 */
export async function getTranslations<N extends Namespace>(
  namespace: N,
): Promise<Translator<N>> {
  const [locale, messages] = await Promise.all([getLocale(), getMessages(namespace)]);
  return createTranslator<N>(locale, messages);
}
