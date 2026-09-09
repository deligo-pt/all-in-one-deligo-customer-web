import { notFound } from "next/navigation";
import {
  AccountListView,
  ProfileView,
  accountNav,
  type AccountListCopy,
  type ProfileCopy,
} from "@/features/account";
import { ContentPage } from "@/components/shared/ContentPage";
import { TranslationProvider } from "@/i18n/TranslationProvider";
import { getLocale } from "@/i18n/server";
import { loadNamespace } from "@/i18n/namespaces";
import { withLocale } from "@/lib/i18n/path";
import { ROUTES } from "@/lib/routes";
import {
  ADDRESS_FIXTURE,
  CARD_FIXTURE,
  PREFERENCES_FIXTURE,
  PROFILE_FIXTURE,
  REFERRAL_FIXTURE,
} from "./fixture";

/**
 * The account screens, populated. **Development only; 404s in production.**
 *
 * Four things worth looking at: the profile the design draws, the shared list
 * view with rows, the same view empty, and the prose shell the twelve help and
 * legal pages use.
 */
export default async function AccountStatesPage() {
  if (process.env.NODE_ENV === "production") notFound();

  const locale = await getLocale();
  const [account, common, nav] = await Promise.all([
    loadNamespace(locale, "account"),
    loadNamespace(locale, "common"),
    loadNamespace(locale, "nav"),
  ]);
  const t = (k: string) => account[k] ?? k;

  const menu = accountNav(locale, {
    profile: t("navProfile"),
    orders: t("navOrders"),
    addresses: t("navAddresses"),
    payment: t("navPayment"),
    vouchers: t("navVouchers"),
    referrals: t("navReferrals"),
    settings: t("navSettings"),
  });

  const profileCopy: ProfileCopy = {
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

  const listCopy = (title: string, subtitle: string): AccountListCopy => ({
    title: t(title),
    subtitle: t(subtitle),
    navLabel: t("navLabel"),
    add: t("addAddress"),
    remove: t("remove"),
    default: t("defaultLabel"),
    emptyTitle: t("addressesEmpty"),
    emptyBody: t("addressesEmptyBody"),
    unavailableTitle: t("unavailableTitle"),
    unavailableBody: t("unavailableBody"),
    notWired: t("notWired"),
  });

  return (
    <TranslationProvider locale={locale} messages={{ common, account, nav }}>
      <div className="flex flex-col gap-16 py-8">
        <ProfileView
          profile={PROFILE_FIXTURE}
          preferences={PREFERENCES_FIXTURE}
          nav={menu}
          editHref={withLocale(ROUTES.settings.path, locale)}
          copy={profileCopy}
        />
        <AccountListView
          rows={ADDRESS_FIXTURE.map((a) => ({
            id: a.id,
            title: a.label,
            body: a.line,
            isDefault: a.isDefault,
            removable: true,
          }))}
          nav={menu}
          activeId="addresses"
          icon="location"
          copy={listCopy("addressesTitle", "addressesSubtitle")}
        />
        <AccountListView
          rows={CARD_FIXTURE.map((c) => ({
            id: c.id,
            title: c.label,
            meta: c.expiry,
            isDefault: c.isDefault,
            removable: true,
          }))}
          nav={menu}
          activeId="payment"
          icon="card"
          copy={listCopy("paymentTitle", "paymentSubtitle")}
        />
        <AccountListView
          rows={[]}
          nav={menu}
          activeId="referrals"
          icon="gift"
          copy={listCopy("referralsTitle", "referralsSubtitle")}
        >
          <section className="border-brand-soft bg-brand-tint rounded-16 flex flex-wrap items-center justify-between gap-6 border p-6">
            <p className="text-32 text-brand-strong font-semibold tracking-wider">
              {REFERRAL_FIXTURE.code}
            </p>
            <p className="text-32 text-brand-strong font-semibold">
              {REFERRAL_FIXTURE.earned}
            </p>
          </section>
        </AccountListView>
        <ContentPage
          title={t("termsTitle")}
          pendingTitle={t("contentPendingTitle")}
          pendingBody={t("contentPendingBody")}
        />
      </div>
    </TranslationProvider>
  );
}
