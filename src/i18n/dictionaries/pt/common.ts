/**
 * `common`, in Portuguese. Exact key parity with `en/common.ts` is enforced
 * twice: by the compiler in `src/i18n/keyParity.ts`, and at runtime by
 * `verify:i18n`, which also checks that the `{placeholders}` match.
 */
const common = {
  appName: "DeliGo",
  tagline: "A entregar conveniência, a capacitar comunidades.",

  language: "Idioma",
  selectLanguage: "Selecionar idioma",

  languageEnglish: "Inglês",
  languagePortuguese: "Português",

  currency: "Moeda",
  date: "Data",
  time: "Hora",
  total: "Total",

  items_one: "{count} artigo",
  items_other: "{count} artigos",

  close: "Fechar",

  comingSoon: "Brevemente",

  backToHome: "Voltar para a página inicial",
} satisfies Record<string, string>;

export default common;
