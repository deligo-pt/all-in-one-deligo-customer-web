import type { Metadata } from "next";
import { AuthPanel } from "@/features/auth";
import { TranslationProvider } from "@/i18n/TranslationProvider";
import { getLocale, getTranslations } from "@/i18n/server";
import { loadNamespace } from "@/i18n/namespaces";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return { title: t("signInTitle"), description: t("welcomeSubtitle") };
}

/**
 * `/login` — the same panel the drawer holds, as a page.
 *
 * **The design does not draw this route.** All four auth frames are the drawer
 * over the landing page, and the drawer is the path a customer normally takes.
 * This exists for the cases where there is nothing to open it over: a
 * bookmark, a link somebody sent, a session that expired mid-navigation, a
 * browser that never ran the JavaScript. All four are real, and all four used
 * to land on a page that had to be maintained separately from the drawer.
 *
 * So it renders `AuthPanel` and nothing else. An earlier version wrapped it in
 * an invented brand panel — a pink half with the wordmark and a tagline — which
 * was a second design for a screen the file already answers. The panel carries
 * its own heading; the page's only job is to centre it and get out of the way.
 *
 * A Server Component that mounts one client leaf. The `auth` namespace is
 * loaded here and sent down for this route only — the locale layout carries
 * `common` and `errors` and nothing else, so no other page in the application
 * pays for these strings.
 */
export default async function LoginPage() {
  const locale = await getLocale();
  // Both dictionaries as objects, not just as translators: the panel mounts a
  // provider of its own, and a nested provider *replaces* the context rather
  // than adding to it — so `common` has to travel with `auth`, or the panel
  // loses the wordmark in its heading and the dialog inside it loses the
  // accessible name on its close button.
  const [authMessages, commonMessages] = await Promise.all([
    loadNamespace(locale, "auth"),
    loadNamespace(locale, "common"),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-narrow flex-1 items-center justify-center px-4 py-16 sm:px-8">
      <TranslationProvider
        locale={locale}
        messages={{ common: commonMessages, auth: authMessages }}
      >
        <AuthPanel />
      </TranslationProvider>
    </div>
  );
}
