import type { SupportPanelCopy } from "@/components/shared/SupportWidget";
import { getTranslations } from "@/i18n/server";

/**
 * The floating panel's words, resolved on the server (Phase 20h).
 *
 * One namespace of its own: the panel is on every page, so this is the only
 * dictionary every route pays for beyond `common` and `errors`. The full
 * `/account/support` page keeps its copy in `account`, where only that route
 * loads it.
 */
export async function supportPanelCopy(): Promise<SupportPanelCopy> {
  const t = await getTranslations("support");
  return {
    launcher: t("launcher"),
    title: t("title"),
    subtitle: t("subtitle"),
    ticket: t("ticket"),
    you: t("you"),
    team: t("team"),
    placeholder: t("placeholder"),
    send: t("send"),
    attachment: t("attachment"),
    loading: t("loading"),
    failed: t("failed"),
    retry: t("retry"),
    sendFailed: t("sendFailed"),
    openFull: t("openFull"),
    topicsTitle: t("topicsTitle"),
    topicsHint: t("topicsHint"),
    sectionOrders: t("sectionOrders"),
    sectionPayments: t("sectionPayments"),
    sectionAccount: t("sectionAccount"),
    prefillOrderIssue: t("prefillOrderIssue"),
    prefillPayment: t("prefillPayment"),
    prefillAccount: t("prefillAccount"),
    topicOrderLate: t("topicOrderLate"),
    topicOrderWrong: t("topicOrderWrong"),
    topicRefundStatus: t("topicRefundStatus"),
    topicUnrecognizedCharge: t("topicUnrecognizedCharge"),
    topicPaymentMethods: t("topicPaymentMethods"),
    topicRequestInvoice: t("topicRequestInvoice"),
    topicAccountAccess: t("topicAccountAccess"),
    topicAppProblem: t("topicAppProblem"),
  };
}
