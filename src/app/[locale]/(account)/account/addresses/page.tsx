import type { Metadata } from "next";
import {
  AccountListView,
  AccountUnavailableError,
  accountNav,
  notWiredAccount,
  type AccountListCopy,
  type AccountListRow,
} from "@/features/account";
import { getLocale, getTranslations } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("account");
  return { title: t("addressesTitle") };
}

/** `/account/addresses` — adapted from the 412px `Address` frame (D-16). */
export default async function AddressesPage() {
  const [t, locale] = await Promise.all([getTranslations("account"), getLocale()]);

  let rows: readonly AccountListRow[] = [];
  let unavailable = false;
  try {
    const addresses = await notWiredAccount.addresses();
    rows = addresses.map((a) => ({
      id: a.id,
      title: a.label,
      body: a.line,
      isDefault: a.isDefault,
      removable: true,
    }));
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
    title: t("addressesTitle"),
    subtitle: t("addressesSubtitle"),
    navLabel: t("navLabel"),
    add: t("addAddress"),
    remove: t("remove"),
    default: t("defaultLabel"),
    emptyTitle: t("addressesEmpty"),
    emptyBody: t("addressesEmptyBody"),
    unavailableTitle: t("unavailableTitle"),
    unavailableBody: t("unavailableBody"),
    notWired: t("notWired"),
  };

  return (
    <AccountListView
      rows={rows}
      nav={nav}
      activeId="addresses"
      icon="location"
      copy={copy}
      unavailable={unavailable}
    />
  );
}
