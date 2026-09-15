import type { Metadata } from "next";
import { CopyButton } from "@/components/shared/CopyButton";
import { AccountListView, accountNav, type Referral } from "@/features/account";
import { getLocale, getTranslations } from "@/i18n/server";
import { accountNavLabels, listCopy } from "@/services/account/copy";
import { readReferral } from "@/services/account/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("account");
  return { title: t("referralsTitle") };
}

/**
 * `/account/referrals` — the customer's own code, its numbers and the points
 * balance (`/referrals/my-referrals`, `/points/my-points`; Phase 20).
 *
 * D-11 answered: a referred customer enters a code only at sign-up
 * (`/auth/login-customer` takes `referralCode`); `PATCH /customers/:id`
 * refuses one afterwards (measured), so this page cannot offer an entry field.
 */
export default async function ReferralsPage() {
  const [t, locale, labels, copy] = await Promise.all([
    getTranslations("account"),
    getLocale(),
    accountNavLabels(),
    listCopy("referrals"),
  ]);
  let referral: Referral | null = null;
  try {
    referral = await readReferral();
  } catch {
    referral = null;
  }

  return (
    <AccountListView
      rows={[]}
      nav={accountNav(locale, labels)}
      activeId="referrals"
      icon="gift"
      copy={copy}
      unavailable={!referral}
    >
      {referral ? (
        <div className="flex flex-col gap-4">
          <section className="border-brand-soft bg-brand-tint rounded-16 flex flex-wrap items-center justify-between gap-6 border p-6">
            <div className="flex flex-col gap-1">
              <p className="text-12 text-ink-warm font-semibold tracking-wide uppercase">
                {t("referralCode")}
              </p>
              <p className="text-32 text-brand-strong font-semibold tracking-wider">
                {referral.code}
              </p>
              {referral.code ? (
                <CopyButton
                  text={referral.code}
                  label={t("copyCode")}
                  copiedLabel={t("copiedCode")}
                  className="mt-2 self-start"
                />
              ) : null}
            </div>
            {referral.points ? (
              <p className="text-20 text-ink-strong font-semibold">{referral.points}</p>
            ) : null}
          </section>
          <dl className="grid gap-4 sm:grid-cols-3">
            {referral.stats.map((stat) => (
              <div
                key={stat.label}
                className="border-line rounded-16 bg-surface flex flex-col gap-1 border p-4"
              >
                <dt className="text-14 text-ink-muted">{stat.label}</dt>
                <dd className="text-20 text-ink-strong font-semibold">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </AccountListView>
  );
}
