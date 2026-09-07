/**
 * Message lookup and interpolation. Pure, synchronous, no React.
 *
 * Both halves of the app share this: the server translator in `@/i18n/server`
 * and the client hook in `@/hooks/useTranslation` are two ways of getting a
 * `messages` object to the same three functions. That is the point — a bug
 * fixed here is fixed in both, and the two cannot drift into formatting the
 * same string differently.
 */

/** A namespace's messages for one locale: flat, string to string. */
export type Messages = Readonly<Record<string, string>>;

/** Values substituted into `{placeholder}` slots. */
export type TranslationValues = Readonly<Record<string, string | number>>;

const PLACEHOLDER = /\{(\w+)\}/g;

/**
 * The names of the `{slots}` a message contains.
 *
 * Used by `verify:i18n` to assert that the English and Portuguese versions of a
 * key take the same values — a PT string that says `{nome}` where EN says
 * `{name}` renders the literal `{nome}` to a Portuguese customer and nothing
 * else goes wrong, which is how that survives review.
 */
export function placeholdersIn(message: string): string[] {
  return [...message.matchAll(PLACEHOLDER)].map((m) => m[1] as string);
}

/**
 * A message, with values substituted.
 *
 * A missing key returns the key itself. That is deliberate and it is also why
 * `verify:i18n` exists: the fallback keeps a missing translation from crashing
 * a page, and the guard keeps it from ever being what a customer sees. Without
 * the guard this fallback is the bug — the old app rendered raw keys on screen.
 *
 * A missing *value* leaves its placeholder in place rather than printing
 * `undefined`, for the same reason: visible, harmless, and caught statically.
 */
export function translate(
  messages: Messages,
  key: string,
  values?: TranslationValues,
): string {
  const message = messages[key];
  if (message === undefined) return key;
  if (!values) return message;
  return message.replace(PLACEHOLDER, (slot, name: string) => {
    const value = values[name];
    return value === undefined ? slot : String(value);
  });
}

/**
 * A message chosen by count: `key_one` / `key_other`, resolved through
 * `Intl.PluralRules` rather than `count === 1`.
 *
 * English and Portuguese happen to share the same one/other split, so a hard
 * comparison would work today. It is written this way because the comparison is
 * what has to be found and undone when a language that does not (Polish, Arabic)
 * is added, and by then it will be spread across every list in the app.
 *
 * `count` is always available to the message as `{count}` without the caller
 * passing it twice.
 */
export function translatePlural(
  messages: Messages,
  key: string,
  count: number,
  bcp47: string,
  values?: TranslationValues,
): string {
  const category = pluralRules(bcp47).select(count);
  const exact = `${key}_${category}`;
  const resolved = messages[exact] !== undefined ? exact : `${key}_other`;
  return translate(messages, resolved, { count, ...values });
}

/** `Intl.PluralRules` construction is not free and the argument set is tiny. */
const pluralRulesCache = new Map<string, Intl.PluralRules>();

function pluralRules(bcp47: string): Intl.PluralRules {
  const cached = pluralRulesCache.get(bcp47);
  if (cached) return cached;
  const created = new Intl.PluralRules(bcp47);
  pluralRulesCache.set(bcp47, created);
  return created;
}
