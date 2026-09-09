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
  return { title: t("paymentTitle") };
}

/**
 * `/account/payment-methods`.
 *
 * A saved card is a brand and four digits — never a PAN. Card details belong
 * to the payment provider (D-14), and the empty state says so rather than
 * leaving the customer to assume otherwise.
 */
export default async function PaymentMethodsPage() {
  const [t, locale] = await Promise.all([getTranslations("account"), getLocale()]);

  let rows: readonly AccountListRow[] = [];
  let unavailable = false;
  try {
    const cards = await notWiredAccount.cards();
    rows = cards.map((c) => ({
      id: c.id,
      title: c.label,
      meta: c.expiry,
      isDefault: c.isDefault,
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
    title: t("paymentTitle"),
    subtitle: t("paymentSubtitle"),
    navLabel: t("navLabel"),
    add: t("addPayment"),
    remove: t("remove"),
    default: t("defaultLabel"),
    emptyTitle: t("paymentEmpty"),
    emptyBody: t("paymentEmptyBody"),
    unavailableTitle: t("unavailableTitle"),
    unavailableBody: t("unavailableBody"),
    notWired: t("notWired"),
  };

  return (
    <AccountListView
      rows={rows}
      nav={nav}
      activeId="payment"
      icon="card"
      copy={copy}
      unavailable={unavailable}
    />
  );
}
