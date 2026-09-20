import type { Metadata } from "next";
import { AddressesView, accountNav, type AccountAddress } from "@/features/account";
import { getLocale, getTranslations } from "@/i18n/server";
import { accountNavLabels, addressesCopy } from "@/services/account/copy";
import { readAccountAddresses } from "@/services/account/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("account");
  return { title: t("addressesTitle") };
}

/** `/account/addresses` — the saved delivery addresses (Phase 20). */
export default async function AddressesPage() {
  const [locale, labels, copy] = await Promise.all([
    getLocale(),
    accountNavLabels(),
    addressesCopy(),
  ]);
  let addresses: AccountAddress[] = [];
  let unavailable = false;
  try {
    addresses = await readAccountAddresses();
  } catch {
    unavailable = true;
  }
  return (
    <AddressesView
      addresses={addresses}
      nav={accountNav(locale, labels)}
      locale={locale}
      copy={copy}
      unavailable={unavailable}
    />
  );
}
