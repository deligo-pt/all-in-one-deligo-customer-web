import { notFound } from "next/navigation";
import { ContentPage } from "@/components/shared/ContentPage";
import {
  AccountListView,
  AddressesView,
  ProfileView,
  SupportView,
  accountNav,
} from "@/features/account";
import { getLocale, getTranslations } from "@/i18n/server";
import { withLocale } from "@/lib/i18n/path";
import {
  accountNavLabels,
  addressesCopy,
  listCopy,
  profileCopy,
  supportCopy,
} from "@/services/account/copy";
import {
  ADDRESS_FIXTURE,
  CARD_FIXTURE,
  PREFERENCES_FIXTURE,
  PROFILE_FIXTURE,
  SUPPORT_FIXTURE,
} from "./fixture";

/**
 * The account screens, populated. **Development only; 404s in production.**
 * The views are the live ones, so every write here is **offline**: it refuses
 * with `previewOnly` and sends nothing.
 */
export default async function AccountStatesPage() {
  if (process.env.NODE_ENV === "production") notFound();

  const [t, locale, labels] = await Promise.all([
    getTranslations("account"),
    getLocale(),
    accountNavLabels(),
  ]);
  const menu = accountNav(locale, labels);
  const offline = t("previewOnly");

  return (
    <div className="flex flex-col gap-16 py-8">
      <ProfileView
        profile={PROFILE_FIXTURE}
        preferences={PREFERENCES_FIXTURE}
        shortcuts={PREFERENCES_FIXTURE}
        stats={[{ id: "points", label: "Reward Points", value: "478", href: "#" }]}
        nav={menu}
        homeHref={withLocale("/", locale)}
        copy={await profileCopy()}
        offlineNotice={offline}
      />
      <AddressesView
        addresses={ADDRESS_FIXTURE}
        nav={menu}
        locale={locale}
        copy={await addressesCopy()}
        offlineNotice={offline}
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
        removes="card"
        copy={await listCopy("payment")}
        offlineNotice={offline}
      />
      <SupportView
        thread={SUPPORT_FIXTURE}
        nav={menu}
        copy={await supportCopy()}
        offlineNotice={offline}
      />
      <ContentPage
        title={t("careersTitle")}
        pendingTitle={t("contentPendingTitle")}
        pendingBody={t("contentPendingBody")}
      />
    </div>
  );
}
