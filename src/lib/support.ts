/**
 * The support model: what a topic is, what a chosen topic types into the
 * composer, and which ticket a customer is actually in.
 *
 * No React, no transport — `lib/` is pure (§3) — so `verify:support` asserts
 * every rule below with no token and no network.
 *
 * ## Why the topic ids never travel
 *
 * The API files a ticket under `category`, and that field is **write-once**:
 * measured on the old app's account, `GENERAL → ORDER_ISSUE` is honoured and
 * every later change is ignored. A customer cannot close their own ticket
 * either (`PATCH …/close` is 403 for customers), so after the first
 * conversation the category is frozen for ever and says nothing about what
 * this conversation is about.
 *
 * What does reach a human is the **first sentence**. So a topic here picks an
 * icon and a label, and {@link buildTopicPrefill} turns it into the sentence
 * the old app types for you — `Payment Question: Unrecognized Charge` —
 * editable, and sent only when the customer presses Send.
 */

/** A row in a topic picker. `id` is local to this build and never sent. */
export type SupportTopic = {
  id: string;
  /** Key in the `support` dictionary. */
  labelKey: string;
  /** Registry name for the row's icon, resolved by the component. */
  icon: string;
};

/**
 * Payments & refunds, in the order the old app lists them.
 *
 * "Payment Methods" and "Request Invoice" both have real destinations in this
 * app (`/account/payment-methods`, and an order's invoice), and the old app
 * still routes all four to the chat. Followed rather than improved on: a
 * customer who picked "Request Invoice" out of a support menu is asking a
 * person for one, not looking for a button.
 */
export const PAYMENT_TOPICS: readonly SupportTopic[] = [
  { id: "REFUND_STATUS", labelKey: "topicRefundStatus", icon: "clock" },
  { id: "UNRECOGNIZED_CHARGE", labelKey: "topicUnrecognizedCharge", icon: "alert" },
  { id: "PAYMENT_METHODS", labelKey: "topicPaymentMethods", icon: "card" },
  { id: "REQUEST_INVOICE", labelKey: "topicRequestInvoice", icon: "tag" },
];

/** Account and app problems — the old app's Account screen and its FAQ rows. */
export const ACCOUNT_TOPICS: readonly SupportTopic[] = [
  { id: "ACCOUNT_ACCESS", labelKey: "topicAccountAccess", icon: "key" },
  { id: "APP_PROBLEM", labelKey: "topicAppProblem", icon: "mobile" },
];

/** Something went wrong with an order. */
export const ORDER_TOPICS: readonly SupportTopic[] = [
  { id: "ORDER_LATE", labelKey: "topicOrderLate", icon: "clock" },
  { id: "ORDER_WRONG", labelKey: "topicOrderWrong", icon: "food" },
];

/** The three pickers, in the order the dialog draws them. */
export const SUPPORT_SECTIONS: readonly {
  id: string;
  /** Key in the `support` dictionary — also the prefill's left half. */
  titleKey: string;
  prefillKey: string;
  topics: readonly SupportTopic[];
}[] = [
  {
    id: "ORDER",
    titleKey: "sectionOrders",
    prefillKey: "prefillOrderIssue",
    topics: ORDER_TOPICS,
  },
  {
    id: "PAYMENT",
    titleKey: "sectionPayments",
    prefillKey: "prefillPayment",
    topics: PAYMENT_TOPICS,
  },
  {
    id: "ACCOUNT",
    titleKey: "sectionAccount",
    prefillKey: "prefillAccount",
    topics: ACCOUNT_TOPICS,
  },
];

/**
 * The sentence a topic row drops into the composer, or `null` for none.
 *
 * Both halves arrive already translated, because `t()` lives in the component
 * and composing inside a dictionary value is not possible with a single
 * argument. A missing half is dropped rather than rendered as a dangling
 * separator, and losing both opens the composer empty rather than typing `": "`
 * at the customer.
 */
export function buildTopicPrefill(
  section: string | null | undefined,
  topic: string | null | undefined,
): string | null {
  const left = section?.trim() || "";
  const right = topic?.trim() || "";

  if (left && right) return `${left}: ${right}`;
  return left || right || null;
}

/**
 * What this input should send, or `null` when there is nothing to send.
 *
 * `null` drives the Send button's disabled state, so the two cannot disagree.
 * The trim is not cosmetic: the API's only rule is `min 1` and it does **not**
 * trim, so three spaces are accepted and land in front of a support agent as
 * an empty grey bubble. The client is the only place that can refuse that.
 */
export function normalizeOutgoingMessage(
  raw: string | null | undefined,
): string | null {
  return raw?.trim() || null;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Reading what the API returns
 * ──────────────────────────────────────────────────────────────────────────── */

export type RawTicket = {
  ticketId?: string | null;
  status?: string | null;
  lastMessageTime?: string | null;
  createdAt?: string | null;
  /**
   * Keyed by **recipient** — `{ ADMIN_GENERAL: 3, "C-EP25QIN7": 0 }` — so
   * reading it needs the customer's own `userId`, which costs a `/profile`
   * call. Nothing here indexes it: the launcher is on every page, and a second
   * request per page for a number that is currently always zero is not a trade
   * worth making. The count belongs on the help-centre row (Phase 20i), where
   * the page already has the profile. Declared so the field is documented
   * rather than rediscovered.
   */
  unreadCount?: Record<string, number> | null;
};

export type RawMessage = {
  _id?: string | null;
  senderRole?: string | null;
  message?: string | null;
  createdAt?: string | null;
  attachments?: (string | null)[] | null;
};

/**
 * Statuses that mean the thread is over.
 *
 * A blacklist rather than a whitelist of `OPEN`, and the direction is the
 * point: a new status the backend invents — `IN_PROGRESS`, say — would make a
 * whitelist hide a live ticket from the customer sitting in it. A blacklist at
 * worst keeps a finished thread on screen, which the next message reopens.
 */
const CLOSED_STATUSES = new Set(["CLOSED", "RESOLVED"]);

/**
 * The ticket the chat should show, or `null` for a customer who has never
 * written in. There is no single-ticket endpoint, so the list is the only
 * place a ticket's unread count can come from.
 *
 * "Newest" is by last activity rather than creation, so a long-running ticket
 * someone replied to today outranks one opened yesterday and abandoned.
 */
export function activeTicket(
  tickets: readonly (RawTicket | null | undefined)[] | null | undefined,
): RawTicket | null {
  if (!Array.isArray(tickets)) return null;

  const activity = (ticket: RawTicket) => {
    const at = Date.parse(ticket.lastMessageTime ?? ticket.createdAt ?? "");
    return Number.isNaN(at) ? -Infinity : at;
  };

  return (
    tickets
      .filter((ticket): ticket is RawTicket => Boolean(ticket?.ticketId))
      .filter((ticket) => !CLOSED_STATUSES.has((ticket.status ?? "").toUpperCase()))
      .sort((a, b) => activity(b) - activity(a))[0] ?? null
  );
}

/** Was this message written by the customer reading it? */
export function isOutgoing(message: RawMessage | null | undefined): boolean {
  return message?.senderRole === "CUSTOMER";
}

/**
 * The thread in reading order, oldest last-to-first.
 *
 * `GET …/messages` answers newest-first and paginates that way, so page 2 is
 * *older* than page 1. Sorting by timestamp rather than reversing is what makes
 * two concatenated pages come out right. Never mutates its input.
 *
 * An unparseable `createdAt` sorts last, which is the useful direction: the
 * realistic source of one is a message still on its way out.
 */
export function chronological(
  messages: readonly (RawMessage | null | undefined)[] | null | undefined,
): RawMessage[] {
  if (!Array.isArray(messages)) return [];

  const at = (message: RawMessage) => {
    const parsed = Date.parse(message.createdAt ?? "");
    return Number.isNaN(parsed) ? Infinity : parsed;
  };

  // `filter` is what copies — sorting its result cannot reach the caller's
  // array. A `.slice()` here would read as the thing keeping this safe and
  // would not be, which is worse than not having one.
  return messages
    .filter((message): message is RawMessage => Boolean(message))
    .sort((a, b) => at(a) - at(b));
}
