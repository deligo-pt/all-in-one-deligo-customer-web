/**
 * The namespace registry: which dictionaries exist, and how to load one.
 *
 * A namespace is a unit of shipping, not a unit of tidiness. Plan.md §6 leaves
 * roughly 53 KB of first-load budget after the framework, and the previous
 * app's single dictionary was ~22 KB gzipped on its own — every page paid for
 * the checkout's strings, the invoice's strings and the help centre's strings.
 * Here a route declares the namespaces it needs and gets nothing else.
 *
 * Two facts make that cheap rather than clever:
 *
 *  1. `loaders` is a static map of `import()` calls, so the bundler emits one
 *     chunk per namespace per locale and can drop the ones a route never asks
 *     for. A dynamic `import(path)` built from a variable would defeat that.
 *  2. Translation happens on the server. A dictionary reaches the browser only
 *     as the resolved strings a client component was handed — the dictionary
 *     modules themselves never enter the client bundle at all.
 *
 * Adding a namespace means: two files under `dictionaries/`, one line in
 * `NAMESPACES`, one line in `Dictionary`, and two lines in `loaders`.
 * `verify:i18n` fails if any of the four is missed.
 */
import type { Locale } from "@/lib/i18n/locale";
import type { Messages } from "@/lib/i18n/translate";

import type commonEn from "./dictionaries/en/common";
import type errorsEn from "./dictionaries/en/errors";
import type footerEn from "./dictionaries/en/footer";
import type navEn from "./dictionaries/en/nav";
import type homeEn from "./dictionaries/en/home";
import type authEn from "./dictionaries/en/auth";
import type foodEn from "./dictionaries/en/food";
import type cartEn from "./dictionaries/en/cart";
import type checkoutEn from "./dictionaries/en/checkout";
import type ordersEn from "./dictionaries/en/orders";
import type accountEn from "./dictionaries/en/account";

export const NAMESPACES = [
  "common",
  "errors",
  "nav",
  "footer",
  "home",
  "auth",
  "food",
  "cart",
  "checkout",
  "orders",
  "account",
] as const;

export type Namespace = (typeof NAMESPACES)[number];

/**
 * The shape of each namespace, taken from the English dictionary.
 *
 * English is the reference not because it matters more, but because one of the
 * two has to be, and every key here is proved to exist in Portuguese as well —
 * by the compiler in `keyParity.ts` and again at runtime by `verify:i18n`.
 * These are `import type`, so they are erased: naming the dictionaries here
 * costs nothing at runtime and does not pull them into any chunk.
 */
export type Dictionary = {
  common: typeof commonEn;
  errors: typeof errorsEn;
  nav: typeof navEn;
  footer: typeof footerEn;
  home: typeof homeEn;
  auth: typeof authEn;
  food: typeof foodEn;
  cart: typeof cartEn;
  checkout: typeof checkoutEn;
  orders: typeof ordersEn;
  account: typeof accountEn;
};

/** Every key a namespace defines — what `t()` will accept. */
export type MessageKey<N extends Namespace> = Extract<keyof Dictionary[N], string>;

/**
 * The base name of a plural pair: `items_one` / `items_other` → `items`.
 *
 * Derived rather than declared, so `t.plural("items", n)` is offered exactly
 * when both forms exist, and a half-written plural is a type error at the call
 * site instead of a missing string at render.
 */
export type PluralKey<N extends Namespace> =
  MessageKey<N> extends infer K
    ? K extends `${infer Base}_other`
      ? Base
      : never
    : never;

const loaders: Record<Locale, Record<Namespace, () => Promise<Messages>>> = {
  en: {
    common: () => import("./dictionaries/en/common").then((m) => m.default),
    errors: () => import("./dictionaries/en/errors").then((m) => m.default),
    nav: () => import("./dictionaries/en/nav").then((m) => m.default),
    footer: () => import("./dictionaries/en/footer").then((m) => m.default),
    home: () => import("./dictionaries/en/home").then((m) => m.default),
    auth: () => import("./dictionaries/en/auth").then((m) => m.default),
    food: () => import("./dictionaries/en/food").then((m) => m.default),
    cart: () => import("./dictionaries/en/cart").then((m) => m.default),
    checkout: () => import("./dictionaries/en/checkout").then((m) => m.default),
    orders: () => import("./dictionaries/en/orders").then((m) => m.default),
    account: () => import("./dictionaries/en/account").then((m) => m.default),
  },
  pt: {
    common: () => import("./dictionaries/pt/common").then((m) => m.default),
    errors: () => import("./dictionaries/pt/errors").then((m) => m.default),
    nav: () => import("./dictionaries/pt/nav").then((m) => m.default),
    footer: () => import("./dictionaries/pt/footer").then((m) => m.default),
    home: () => import("./dictionaries/pt/home").then((m) => m.default),
    auth: () => import("./dictionaries/pt/auth").then((m) => m.default),
    food: () => import("./dictionaries/pt/food").then((m) => m.default),
    cart: () => import("./dictionaries/pt/cart").then((m) => m.default),
    checkout: () => import("./dictionaries/pt/checkout").then((m) => m.default),
    orders: () => import("./dictionaries/pt/orders").then((m) => m.default),
    account: () => import("./dictionaries/pt/account").then((m) => m.default),
  },
};

export function loadNamespace(locale: Locale, namespace: Namespace): Promise<Messages> {
  return loaders[locale][namespace]();
}
