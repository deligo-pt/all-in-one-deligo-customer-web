import Link from "next/link";
import { getLocale, getTranslations } from "@/i18n/server";

// A 404 has to speak the customer's language too, which is only possible
// because the locale is in the URL — the segment is known even when the rest of
// the path matches nothing. Phase 4 owns the full set of route boundaries
// (error, loading, not-found) and the design they follow; this one exists now
// because locale routing without it means an unknown path falls out of the
// language tree entirely.
export default async function NotFound() {
  const [t, common, locale] = await Promise.all([
    getTranslations("errors"),
    getTranslations("common"),
    getLocale(),
  ]);

  return (
    <main className="flex flex-1 items-center justify-center p-16">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold">{t("notFoundTitle")}</h1>
        <p className="mt-3 text-sm opacity-60">{t("notFoundDescription")}</p>
        <Link className="mt-6 inline-block text-sm underline" href={`/${locale}`}>
          {common("backToHome")}
        </Link>
      </div>
    </main>
  );
}
