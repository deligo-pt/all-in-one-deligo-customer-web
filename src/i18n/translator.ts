/**
 * `t` — built once from a locale and a namespace's messages, then handed to
 * whoever needs it.
 *
 * The server builds one per render; the client hook builds one per namespace it
 * was given. Both call the same pure functions in `@/lib/i18n/translate`, which
 * is what stops the two halves of the app from formatting the same string two
 * different ways.
 */
import { BCP47, type Locale } from "@/lib/i18n/locale";
import {
  translate,
  translatePlural,
  type Messages,
  type TranslationValues,
} from "@/lib/i18n/translate";
import type { MessageKey, Namespace, PluralKey } from "./namespaces";

/**
 * Callable, with `plural` hanging off it.
 *
 * `t(key)` where `key` is not in that namespace is a type error, which is the
 * whole reason the namespace is a type parameter rather than a string.
 */
export type Translator<N extends Namespace> = {
  (key: MessageKey<N>, values?: TranslationValues): string;
  plural(key: PluralKey<N>, count: number, values?: TranslationValues): string;
};

export function createTranslator<N extends Namespace>(
  locale: Locale,
  messages: Messages,
): Translator<N> {
  const t = (key: MessageKey<N>, values?: TranslationValues) =>
    translate(messages, key, values);

  return Object.assign(t, {
    plural: (key: PluralKey<N>, count: number, values?: TranslationValues) =>
      translatePlural(messages, key, count, BCP47[locale], values),
  });
}
