import type { Metadata } from "next";
import { SignOutButton } from "@/components/shared/SignOutButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import {
  AccountUnavailableError,
  ProfileView,
  accountNav,
  notWiredAccount,
  type Preference,
  type Profile,
  type ProfileCopy,
} from "@/features/account";
import { getLocale, getTranslations } from "@/i18n/server";
import { withLocale } from "@/lib/i18n/path";
import { ROUTES } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("account");
  return { title: t("title") };
}

/** `/account` — the one account screen the design draws (1440×1798). */
export default async function AccountPage() {
  const [t, locale] = await Promise.all([getTranslations("account"), getLocale()]);

  let profile: Profile | null = null;
  try {
    profile = await notWiredAccount.profile();
  } catch (error) {
    if (!(error instanceof AccountUnavailableError)) throw error;
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

  if (!profile) {
    return (
      <div className="max-w-shell mx-auto w-full px-8 py-16">
        <EmptyState
          icon={<Icon name="user" className="size-8" />}
          title={t("unavailableTitle")}
          description={t("unavailableBody")}
          // Signing out needs no profile. Without this the only way out of a
          // session is to wait for its token to expire (Phase 15).
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
  // Terms. Language reads the active locale rather than a stored preference —
  // it is what the customer is looking at, which is the only honest answer
  // until Phase 20 has one to store.
  const preferences: Preference[] = [
    { id: "language", label: t("prefLanguage"), value: locale.toUpperCase() },
    {
      id: "support",
      label: t("prefSupport"),
      href: withLocale(ROUTES.help.path, locale),
    },
    {
      id: "safety",
      label: t("prefSafety"),
      href: withLocale(ROUTES.help.path, locale),
    },
    {
      id: "referrals",
      label: t("navReferrals"),
      href: withLocale(ROUTES.referrals.path, locale),
    },
    {
      id: "privacy",
      label: t("prefPrivacy"),
      href: withLocale(ROUTES.privacy.path, locale),
    },
    { id: "terms", label: t("prefTerms"), href: withLocale(ROUTES.terms.path, locale) },
  ];

  const copy: ProfileCopy = {
    title: t("title"),
    subtitle: t("subtitle"),
    navLabel: t("navLabel"),
    editProfile: t("editProfile"),
    changeImage: t("changeImage"),
    avatarAlt: t("avatarAlt"),
    personalInformation: t("personalInformation"),
    edit: t("edit"),
    fullName: t("fullName"),
    phone: t("phone"),
    email: t("email"),
    emergencyContact: t("emergencyContact"),
    emergencyContactBody: t("emergencyContactBody"),
    contactName: t("contactName"),
    preferences: t("preferences"),
    memberSince: t("memberSince"),
    accountId: t("accountId"),
    logout: t("logout"),
    version: t("version"),
  };

  return (
    <ProfileView
      profile={profile}
      preferences={preferences}
      nav={nav}
      editHref={withLocale(ROUTES.settings.path, locale)}
      homeHref={withLocale("/", locale)}
      copy={copy}
    />
  );
}
