"use client";
/**
 * Switching language by navigating.
 *
 * The locale is a route segment, so changing it is a navigation to the same
 * page under a different prefix — not a store update that re-renders half the
 * tree. That is the practical difference D-2 was about: the previous app kept
 * the language in a Zustand store, which meant a Portuguese page and an English
 * page shared one URL and neither could be linked to, bookmarked or indexed.
 *
 * Nothing here writes the language cookie. The proxy sees the request for
 * `/en/...` and records the choice, so one piece of code decides what the
 * cookie says. Two would eventually disagree.
 *
 * A `<select>` is the whole control for now. Phase 4 places the real switcher in
 * the footer next to the currency picker, and Phase 3 provides the styled
 * primitive it will use; what has to be right *here* is the behaviour and the
 * accessible name.
 */
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { LOCALES, isLocale, type Locale } from "@/lib/i18n/locale";
import { withLocale } from "@/lib/i18n/path";
import { useTranslation } from "@/hooks/useTranslation";

/** Each language is named in its own language — a Portuguese reader scans for
 *  "Português", not for "Portuguese". */
const LANGUAGE_NAME_KEY = {
  en: "languageEnglish",
  pt: "languagePortuguese",
} as const satisfies Record<Locale, string>;

/**
 * `compact` shows the code ("PT", "EN") instead of the language's name — the
 * header's form, as the old app's navbar had it. The full name is 116px wide
 * and was what pushed the desktop header past its own container (Phase 20
 * responsive pass); the menu drawer keeps the full name, where there is room.
 * Each option still carries the full name as its accessible label.
 */
export function LocaleSwitcher({
  className,
  compact = false,
}: { className?: string; compact?: boolean } = {}) {
  const { t, locale } = useTranslation("common");
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <label className={`inline-flex items-center gap-2 text-sm ${className ?? ""}`}>
      <span className="sr-only">{t("selectLanguage")}</span>
      <select
        className="rounded border border-black/15 bg-transparent px-2 py-1"
        value={locale}
        disabled={isPending}
        onChange={(event) => {
          const next = event.target.value;
          if (!isLocale(next) || next === locale) return;
          startTransition(() => {
            router.replace(withLocale(pathname, next));
          });
        }}
      >
        {LOCALES.map((option) => (
          <option
            key={option}
            value={option}
            aria-label={compact ? t(LANGUAGE_NAME_KEY[option]) : undefined}
          >
            {compact ? option.toUpperCase() : t(LANGUAGE_NAME_KEY[option])}
          </option>
        ))}
      </select>
    </label>
  );
}
