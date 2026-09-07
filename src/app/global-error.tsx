"use client";

import "./globals.css";
import { DEFAULT_LOCALE, BCP47 } from "@/lib/i18n/locale";
import commonEn from "@/i18n/dictionaries/en/common";
import commonPt from "@/i18n/dictionaries/pt/common";
import errorsEn from "@/i18n/dictionaries/en/errors";
import errorsPt from "@/i18n/dictionaries/pt/errors";

/**
 * The last boundary: it renders when the root layout itself has failed.
 *
 * That means no provider, no server context, no `next/root-params` — nothing
 * that normally supplies a language. The dictionaries are therefore imported
 * directly and indexed by the default locale. Both are a few hundred bytes and
 * this file is its own chunk, loaded only when everything else has already gone
 * wrong.
 *
 * It replaces the entire document, so it renders its own `<html>` and `<body>`
 * — and its own stylesheet import, because the layout that would have loaded it
 * is the thing that failed. That import is what lets this page use the same
 * tokens as the rest of the app instead of a second set of hard-coded colours
 * that nobody would ever notice drifting.
 */
const COMMON = { en: commonEn, pt: commonPt };
const ERRORS = { en: errorsEn, pt: errorsPt };

export default function GlobalError({ reset }: { reset: () => void }) {
  const common = COMMON[DEFAULT_LOCALE];
  const errors = ERRORS[DEFAULT_LOCALE];

  return (
    <html lang={BCP47[DEFAULT_LOCALE]}>
      <body className="bg-surface text-ink-strong flex min-h-screen items-center justify-center">
        <main className="px-8 text-center">
          <h1 className="text-20 font-semibold">{common.appName}</h1>
          <p className="text-14 text-ink-muted mt-3">{errors.criticalError}</p>
          <button
            type="button"
            onClick={reset}
            className="bg-brand text-ink-inverse text-14 rounded-4 mt-6 h-11 px-6 font-medium"
          >
            {errors.tryAgain}
          </button>
        </main>
      </body>
    </html>
  );
}
