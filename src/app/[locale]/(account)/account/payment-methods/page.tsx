import type { Metadata } from "next";
import { AccountListView, accountNav, type AccountListRow } from "@/features/account";
import { getLocale, getTranslations } from "@/i18n/server";
import { accountNavLabels, listCopy } from "@/services/account/copy";
import { readSavedCards } from "@/services/checkout/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("account");
  return { title: t("paymentTitle") };
}

/** `/account/payment-methods` — the saved cards checkout offers (Phase 20):
 *  a label and an expiry, never a number (D-14). */
export default async function PaymentMethodsPage() {
  const [locale, labels, copy] = await Promise.all([
    getLocale(),
    accountNavLabels(),
    listCopy("payment"),
  ]);
  let rows: AccountListRow[] = [];
  let unavailable = false;
  try {
    rows = (await readSavedCards()).map((card) => ({
      id: card.id,
      title: card.label,
      meta: card.expiry,
      isDefault: card.isDefault,
      removable: true,
    }));
  } catch {
    unavailable = true;
  }
  return (
    <AccountListView
      rows={rows}
      activeId="payment"
      icon="card"
      removes="card"
      nav={accountNav(locale, labels)}
      copy={copy}
      unavailable={unavailable}
    />
  );
}
