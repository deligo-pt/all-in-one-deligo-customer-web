/**
 * Vocabulary that is not owned by any one screen.
 *
 * A key belongs here only if it is genuinely app-wide. "Add to cart" is not
 * app-wide, it is the cart's — it will live in a `cart` namespace when Phase 9
 * creates one. The previous project had a single 1,258-key dictionary and every
 * page paid for every string in it; namespaces exist so a route ships the words
 * it uses and no others.
 *
 * Portuguese translations here are carried verbatim from the previous app where
 * it had the same string, so no professionally translated copy is re-invented.
 */
const common = {
  appName: "DeliGo",
  tagline: "Delivering convenience, empowering communities.",

  // The footer's language control and its accessible name. The visible label
  // and the name a screen reader announces are separate strings because they
  // are separate sentences — "Language" labels the control, "Select language"
  // describes the action.
  language: "Language",
  selectLanguage: "Select language",

  // Language names are written in their own language, always. A Portuguese
  // reader looking for their language looks for "Português", not "Portuguese",
  // and an English reader looking for theirs does not read Portuguese.
  languageEnglish: "English",
  languagePortuguese: "Português",

  currency: "Currency",
  date: "Date",
  time: "Time",
  total: "Total",

  // Plural forms are selected through `Intl.PluralRules`, not `count === 1`.
  // English and Portuguese share the same one/other split; a language that does
  // not will need only a new key here, not a new branch at the call site.
  items_one: "{count} item",
  items_other: "{count} items",

  close: "Close",

  comingSoon: "Coming soon",

  backToHome: "Back to home",
} satisfies Record<string, string>;

export default common;
