import type { Metadata } from "next";
import {
  AccountListView,
  AccountUnavailableError,
  accountNav,
  notWiredAccount,
  type AccountListCopy,
  type Referral,
} from "@/features/account";
import { getLocale, getTranslations } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("account");
  return { title: t("referralsTitle") };
}

/**
 * `/account/referrals` — **D-11's home**.
 *
 * The old app collected a referral code on the sign-in form; the design has no
 * such field, and D-11's position was that this page is where a code
 * plausibly belongs instead. It shows the customer's own code and what it has
 * earned. Whether a *referred* customer can still enter one is the half of
 * D-11 that is still open, and Phase 20 must answer it — a referral programme
 * with no entry point is not a programme.
 */
export default async function ReferralsPage() {
  const [t, locale] = await Promise.all([getTranslations("account"), getLocale()]);

  let referral: Referral | null = null;
  let unavailable = false;
  try {
    referral = await notWiredAccount.referral();
  } catch (error) {
    if (!(error instanceof AccountUnavailableError)) throw error;
    unavailable = true;
  }

  const nav = accountNav(locale, {
    profile: t("navProfile"),
    orders: t("navOrders"),
    addresses: t("navAddresses"),
    payment: t("navPayment"),
    vouchers: t("navVouchers"),
    referrals: t("navReferrals"),
    settings: t("navSettings"),
  });

  const copy: AccountListCopy = {
    title: t("referralsTitle"),
    subtitle: t("referralsSubtitle"),
    navLabel: t("navLabel"),
    remove: t("remove"),
    default: t("defaultLabel"),
    emptyTitle: t("referralsEmpty"),
    emptyBody: t("referralsEmptyBody"),
    unavailableTitle: t("unavailableTitle"),
    unavailableBody: t("unavailableBody"),
    notWired: t("notWired"),
  };

  return (
    <AccountListView
      rows={[]}
      nav={nav}
      activeId="referrals"
      icon="gift"
      copy={copy}
      unavailable={unavailable}
    >
      {referral ? (
        <section className="border-brand-soft bg-brand-tint rounded-16 flex flex-wrap items-center justify-between gap-6 border p-6">
          <div className="flex flex-col gap-1">
            <p className="text-12 text-ink-warm font-semibold tracking-wide uppercase">
              {t("referralCode")}
            </p>
            <p className="text-32 text-brand-strong font-semibold tracking-wider">
              {referral.code}
            </p>
          </div>
          {/* Verbatim. What a referral has earned is the backend's sum. */}
          {referral.earned ? (
            <div className="flex flex-col gap-1">
              <p className="text-12 text-ink-warm font-semibold tracking-wide uppercase">
                {t("referralEarned")}
              </p>
              <p className="text-32 text-brand-strong font-semibold">
                {referral.earned}
              </p>
            </div>
          ) : null}
        </section>
      ) : null}
    </AccountListView>
  );
}
