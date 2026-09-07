import { notFound } from "next/navigation";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { getLocale, getTranslations } from "@/i18n/server";
import { formatCurrency, formatDate, formatTime } from "@/lib/i18n/format";

// A fixed instant rather than `new Date()`: this page is statically generated,
// so "now" would be frozen at build time and quietly lie. It is also what makes
// the two language versions comparable at a glance.
const SAMPLE_INSTANT = "2026-08-15T14:30:00Z";
const SAMPLE_AMOUNT = 12.5;
const SAMPLE_ITEM_COUNT = 3;

/**
 * Formatting, in the active language.
 *
 * The third development-only page, beside `/tokens` and `/primitives`, and the
 * same arrangement: it prerenders as a 404 in a production build. It renders
 * the things most likely to be silently wrong in one language and right in the
 * other — a plural, a price, a date, a time — because none of those look the
 * same in `pt-PT` as they do in `en-GB` and none of them are visible in a
 * screenshot of the other language.
 *
 * It was Phase 2's exit artifact. It is kept because Phase 10 formats money and
 * Phase 11 formats delivery times, and both will want somewhere to look.
 */
export default async function Page() {
  if (process.env.NODE_ENV === "production") notFound();

  const [t, locale] = await Promise.all([getTranslations("common"), getLocale()]);

  const rows: Array<{ label: string; value: string }> = [
    { label: t("language"), value: locale },
    { label: t("currency"), value: formatCurrency(SAMPLE_AMOUNT, locale) },
    { label: t("date"), value: formatDate(SAMPLE_INSTANT, locale) },
    { label: t("time"), value: formatTime(SAMPLE_INSTANT, locale) },
    { label: t("total"), value: t.plural("items", SAMPLE_ITEM_COUNT) },
  ];

  return (
    <main className="flex flex-1 items-center justify-center p-16">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold">{t("appName")}</h1>
        <p className="mt-2 text-sm opacity-60">{t("tagline")}</p>

        <dl className="mt-8 space-y-1 text-sm">
          {rows.map((row) => (
            <div key={row.label} className="flex justify-between gap-4">
              <dt className="opacity-60">{row.label}</dt>
              <dd className="font-medium">{row.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-8">
          <LocaleSwitcher />
        </div>
      </div>
    </main>
  );
}
