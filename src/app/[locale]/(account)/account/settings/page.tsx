import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { AccountShell, accountNav } from "@/features/account";
import { getLocale, getTranslations } from "@/i18n/server";
import { withLocale } from "@/lib/i18n/path";
import { ROUTES } from "@/lib/routes";
import { accountNavLabels } from "@/services/account/copy";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("account");
  return { title: t("settingsTitle") };
}

/**
 * `/account/settings`.
 *
 * **Account deletion has no customer endpoint** (D-21): the API offers none,
 * and the old app showed a success message after calling nothing. Deletion is
 * requested from DeliGo support — the button opens the support chat with the
 * request written out, and the customer sends it. Nothing is sent from here.
 */
export default async function SettingsPage() {
  const [t, locale, labels] = await Promise.all([
    getTranslations("account"),
    getLocale(),
    accountNavLabels(),
  ]);
  const request = `${withLocale(ROUTES.support.path, locale)}?message=${encodeURIComponent(t("deleteRequestMessage"))}`;

  return (
    <AccountShell
      title={t("settingsTitle")}
      subtitle={t("settingsSubtitle")}
      nav={accountNav(locale, labels)}
      activeId="settings"
      navLabel={t("navLabel")}
    >
      <section className="border-danger/40 rounded-16 bg-surface flex flex-col items-start gap-3 border p-6">
        <h2 className="text-20 text-danger font-semibold">{t("dangerZone")}</h2>
        <p className="text-14 text-ink-warm max-w-prose">{t("dangerZoneBody")}</p>
        <p className="text-14 text-ink-warm max-w-prose">{t("deleteViaSupport")}</p>
        <Button asChild variant="danger" className="mt-2">
          <Link href={request}>{t("deleteAccount")}</Link>
        </Button>
      </section>
    </AccountShell>
  );
}
