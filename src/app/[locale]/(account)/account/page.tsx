import type { Metadata } from "next";
import { SignOutButton } from "@/components/shared/SignOutButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import {
  ProfileView,
  accountNav,
  type Preference,
  type Profile,
  type ProfileStat,
} from "@/features/account";
import { getLocale, getTranslations } from "@/i18n/server";
import { withLocale } from "@/lib/i18n/path";
import { ROUTES } from "@/lib/routes";
import { accountNavLabels, profileCopy } from "@/services/account/copy";
import { readProfile, readProfileStats } from "@/services/account/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("account");
  return { title: t("title") };
}

/** `/account` — the one account screen the design draws (1440×1798), from
 *  `GET /profile` (Phase 20). */
export default async function AccountPage() {
  const [t, locale, labels] = await Promise.all([
    getTranslations("account"),
    getLocale(),
    accountNavLabels(),
  ]);

  let profile: Profile | null = null;
  try {
    profile = await readProfile();
  } catch {
    profile = null;
  }

  if (!profile) {
    return (
      <div className="max-w-shell mx-auto w-full px-4 sm:px-8 py-16">
        <EmptyState
          icon={<Icon name="user" className="size-8" />}
          title={t("unavailableTitle")}
          description={t("unavailableBody")}
          // Signing out needs no profile (Phase 15).
          action={
            <SignOutButton
              label={t("logout")}
              homeHref={withLocale("/", locale)}
              className="text-16 text-danger"
            />
          }
        />
      </div>
    );
  }

  // The design lists Language, Support, Safety, Refer & Earn, Privacy and
  // Terms; the old profile added the Help Center. Language is the switch.
  const at = (path: string) => withLocale(path, locale);
  const preferences: Preference[] = [
    { id: "language", label: t("prefLanguage"), control: "language" },
    { id: "support", label: t("prefSupport"), href: at(ROUTES.support.path) },
    { id: "help", label: t("prefHelpCenter"), href: at(ROUTES.help.path) },
    { id: "safety", label: t("prefSafety"), href: at(ROUTES.help.path) },
    { id: "privacy", label: t("prefPrivacy"), href: at(ROUTES.privacy.path) },
    { id: "terms", label: t("prefTerms"), href: at(ROUTES.terms.path) },
  ];
  // The old profile's "Orders & Payments" rows, with their descriptions.
  const shortcuts: Preference[] = [
    {
      id: "orders",
      label: t("navOrders"),
      description: t("ordersDescription"),
      href: at(ROUTES.orders.path),
    },
    {
      id: "payment",
      label: t("navPayment"),
      description: t("paymentMethodsDescription"),
      href: at(ROUTES.paymentMethods.path),
    },
    {
      id: "referrals",
      label: t("navReferrals"),
      description: t("referralsDescription"),
      href: at(ROUTES.referrals.path),
    },
  ];
  const counts = await readProfileStats().catch(() => ({
    vouchers: undefined,
    points: undefined,
  }));
  const stats: ProfileStat[] = [
    ...(counts.vouchers !== undefined
      ? [
          {
            id: "vouchers",
            label: t("statVouchers"),
            value: counts.vouchers,
            href: at(ROUTES.vouchers.path),
          },
        ]
      : []),
    ...(counts.points !== undefined
      ? [
          {
            id: "points",
            label: t("statPoints"),
            value: counts.points,
            href: at(ROUTES.referrals.path),
          },
        ]
      : []),
  ];

  return (
    <ProfileView
      profile={profile}
      preferences={preferences}
      shortcuts={shortcuts}
      stats={stats}
      nav={accountNav(locale, labels)}
      homeHref={at("/")}
      copy={await profileCopy()}
    />
  );
}
