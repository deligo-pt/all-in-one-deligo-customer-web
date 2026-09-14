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
  return { title: t("vouchersTitle") };
}

/**
 * `/account/vouchers`.
 *
 * The same `Voucher` the checkout sheet applies, listed rather than restated —
 * one object, two screens. Its terms are printed verbatim; "You save €8.00" is
 * the voucher's own arithmetic.
 */
export default async function VouchersPage() {
  const [t, locale] = await Promise.all([getTranslations("account"), getLocale()]);

  let rows: readonly AccountListRow[] = [];
  let unavailable = false;
  try {
    const vouchers = await notWiredAccount.vouchers();
    rows = vouchers.map((v) => ({
      id: v.id,
      title: v.code ?? v.title,
      body: v.description,
      meta: v.terms,
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
    title: t("vouchersTitle"),
    subtitle: t("vouchersSubtitle"),
    navLabel: t("navLabel"),
    remove: t("remove"),
    default: t("defaultLabel"),
    emptyTitle: t("vouchersEmpty"),
    emptyBody: t("vouchersEmptyBody"),
    unavailableTitle: t("unavailableTitle"),
    unavailableBody: t("unavailableBody"),
    notWired: t("notWired"),
  };

  return (
    <AccountListView
      rows={rows}
      nav={nav}
      activeId="vouchers"
      icon="tag"
      copy={copy}
      unavailable={unavailable}
    />
  );
}
