import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { AccountShell, accountNav } from "@/features/account";
import { getLocale, getTranslations } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("account");
  return { title: t("settingsTitle") };
}

/**
 * `/account/settings`.
 *
 * The design has no settings screen — the profile's menu points here and stops
 * (D-16). What it does have is the one thing this page must not get wrong:
 * account deletion. So the page ships the destructive action, spelled out —
 * what goes, what is kept, and why — rather than a toggle list invented to
 * fill the space.
 *
 * The button is pressable and refuses. `deleteAccount` is irreversible, and a
 * stub that resolved would tell a customer their account was gone when it was
 * not.
 */
export default async function SettingsPage() {
  const [t, locale] = await Promise.all([getTranslations("account"), getLocale()]);

  const nav = accountNav(locale, {
    profile: t("navProfile"),
    orders: t("navOrders"),
    addresses: t("navAddresses"),
    payment: t("navPayment"),
    vouchers: t("navVouchers"),
    referrals: t("navReferrals"),
    settings: t("navSettings"),
  });

  return (
    <AccountShell
      title={t("settingsTitle")}
      subtitle={t("settingsSubtitle")}
      nav={nav}
      activeId="settings"
      navLabel={t("navLabel")}
    >
      <section className="border-danger/40 rounded-16 bg-surface flex flex-col items-start gap-3 border p-6">
        <h2 className="text-20 text-danger font-semibold">{t("dangerZone")}</h2>
        <p className="text-14 text-ink-warm max-w-prose">{t("dangerZoneBody")}</p>
        <Button variant="danger" className="mt-2">
          {t("deleteAccount")}
        </Button>
      </section>
    </AccountShell>
  );
}
