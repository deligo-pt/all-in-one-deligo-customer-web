/**
 * The support panel's words (Phase 20h).
 *
 * Its own namespace because the panel is mounted on **every** page: these
 * strings reach the browser everywhere, and they are the only ones that should
 * — the full support page keeps its copy in `account`.
 *
 * The `prefill*` values are the left half of the sentence a topic types into
 * the composer (`Payment Question: Unrecognized Charge`), carried over from the
 * old app's own translation file. They are read by a support agent, so they are
 * short and say what the conversation is about.
 */
const support = {
  launcher: "Support",
  title: "DeliGo support",
  subtitle: "Ask about an order, a payment or your account.",
  ticket: "Ticket",
  you: "You",
  team: "DeliGo support",
  placeholder: "Write a message…",
  send: "Send",
  attachment: "Open attachment",
  loading: "Loading the conversation…",
  failed: "The conversation could not be loaded.",
  retry: "Try again",
  sendFailed: "The message could not be sent.",
  openFull: "Open the full conversation",
  topicsTitle: "What do you need help with?",
  topicsHint: "Pick one and we write the first line — you can change it.",
  sectionOrders: "Orders",
  sectionPayments: "Payments & refunds",
  sectionAccount: "Account & app",
  prefillOrderIssue: "Order Issue",
  prefillPayment: "Payment Question",
  prefillAccount: "Account Help",
  topicOrderLate: "Late or missing order",
  topicOrderWrong: "Wrong or damaged items",
  topicRefundStatus: "Refund Status",
  topicUnrecognizedCharge: "Unrecognized Charge",
  topicPaymentMethods: "Payment Methods",
  topicRequestInvoice: "Request Invoice",
  topicAccountAccess: "Account access",
  topicAppProblem: "A problem with the app",
} satisfies Record<string, string>;

export default support;
