import type { Metadata } from "next";
import { AccountListView, accountNav, type AccountListRow } from "@/features/account";
import { getLocale, getTranslations } from "@/i18n/server";
import { accountNavLabels, listCopy } from "@/services/account/copy";
import { readOffers } from "@/services/account/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("account");
  return { title: t("vouchersTitle") };
}

/** `/account/vouchers` — the customer's offers (`GET /offers`), in the same
 *  shape the checkout's voucher sheet shows them (Phase 20). */
export default async function VouchersPage() {
  const [locale, labels, copy] = await Promise.all([
    getLocale(),
    accountNavLabels(),
    listCopy("vouchers"),
  ]);
  let rows: AccountListRow[] = [];
  let unavailable = false;
  try {
    rows = (await readOffers()).map((voucher) => ({
      id: voucher.id,
      title: voucher.code ? `${voucher.code} · ${voucher.title}` : voucher.title,
      body: voucher.description,
      meta: voucher.terms ?? voucher.message,
      copyText: voucher.code,
    }));
  } catch {
    unavailable = true;
  }
  return (
    <AccountListView
      rows={rows}
      nav={accountNav(locale, labels)}
      activeId="vouchers"
      icon="tag"
      copy={copy}
      unavailable={unavailable}
    />
  );
}
