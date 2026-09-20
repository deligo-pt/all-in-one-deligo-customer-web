import type { Metadata } from "next";
import { SupportView, accountNav, type SupportThread } from "@/features/account";
import { getLocale, getTranslations } from "@/i18n/server";
import { isCheckoutId } from "@/lib/checkout";
import { accountNavLabels, supportCopy } from "@/services/account/copy";
import { readProfile, readSupport } from "@/services/account/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("account");
  return { title: t("supportTitle") };
}

/** `/account/support` — the customer's support chat (Phase 20). `?message=`
 *  pre-fills the composer; nothing is sent until the customer presses Send. */
export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<{
    message?: string | string[];
    order?: string | string[];
    ref?: string | string[];
  }>;
}) {
  const [locale, labels, copy, query, t] = await Promise.all([
    getLocale(),
    accountNavLabels(),
    supportCopy(),
    searchParams,
    getTranslations("account"),
  ]);
  // `?order=` is the order's Mongo id (the API's `referenceOrderId`) and
  // `?ref=` its `ORD-…` reference for the pre-written sentence.
  const orderRecordId = isCheckoutId(query.order) ? query.order : undefined;
  const reference =
    typeof query.ref === "string" && /^[\w-]{1,40}$/.test(query.ref) ? query.ref : "";
  const prefill =
    typeof query.message === "string"
      ? query.message
      : orderRecordId && reference
        ? t("supportOrderIssue", { reference })
        : "";
  let thread: SupportThread = { messages: [], unread: 0 };
  let unavailable = false;
  try {
    thread = await readSupport((await readProfile()).accountId);
  } catch {
    unavailable = true;
  }
  return (
    <SupportView
      thread={thread}
      nav={accountNav(locale, labels)}
      initialMessage={prefill}
      orderRecordId={orderRecordId}
      copy={copy}
      unavailable={unavailable}
    />
  );
}
