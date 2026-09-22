import type { OutcomeCopy } from "@/features/payment";
import { getTranslations } from "@/i18n/server";

/** The payment return's words, for the two routes that render them. */
export async function outcomeCopy(): Promise<OutcomeCopy> {
  // Two namespaces: the button is the checkout's, the sentence it types is the
  // support panel's — the same one its topic rows build, so a payment question
  // reads the same to an agent however it was started (Phase 20h).
  const [t, support] = await Promise.all([
    getTranslations("checkout"),
    getTranslations("support"),
  ]);
  return {
    contactSupport: t("contactSupport"),
    supportPrefill: support("prefillPayment"),
    finishing: t("returnFinishing"),
    failedTitle: t("returnFailedTitle"),
    failedBody: t("returnFailedBody"),
    missingTitle: t("returnMissingTitle"),
    missingBody: t("returnMissingBody"),
    retry: t("retry"),
    viewOrders: t("viewOrders"),
    backToCart: t("backToCart"),
    paymentFailedTitle: t("failedTitle"),
    paymentFailedBody: t("failedBody"),
    confirmed: {
      title: t("confirmedTitle"),
      body: t("confirmedBody"),
      close: t("confirmedClose"),
      reference: t("confirmedReference"),
      delivery: t("confirmedDelivery"),
      payment: t("confirmedPayment"),
      total: t("confirmedTotal"),
      stayUpdated: t("confirmedStayUpdated"),
      stayUpdatedBody: t("confirmedStayUpdatedBody"),
      backHome: t("confirmedBackHome"),
    },
  };
}
