/**
 * The support chat's reads and writes, from the browser (Phase 20h).
 *
 * The full `/account/support` page renders on the server; this is the same
 * conversation reached from the floating panel, which can open on any route
 * and therefore cannot be server-rendered into the page it opens over.
 *
 * ## What the API does
 *
 * Measured on the owner's account for the old app and unchanged here:
 * `POST /support/send-message` joins the customer's one open ticket or opens
 * it; `GET /support/tickets` is the only place a ticket's status lives (there
 * is no single-ticket endpoint); `GET /support/tickets/:ticketId/messages`
 * answers **newest first**; `PATCH …/read` marks the customer's unread
 * messages read. `PATCH …/close` is 403 for customers, so nothing here closes
 * anything.
 *
 * ## Nothing is requested until the panel is opened
 *
 * The launcher is on every page. A thread read on mount would be a third
 * request per page for a conversation almost nobody is having, on a backend
 * that answers in 0.75–1.2 s — so the first read happens on the first press.
 */
import { formatTime } from "@/lib/i18n/format";
import type { Locale } from "@/lib/i18n/locale";
import {
  activeTicket,
  chronological,
  isOutgoing,
  normalizeOutgoingMessage,
  type RawMessage,
  type RawTicket,
} from "@/lib/support";

const session = () => import("@/services/session/browser");

export type SupportMessageView = {
  id: string;
  mine: boolean;
  text: string;
  time: string;
  attachments: string[];
};

export type SupportThreadView = {
  ticketId: string | null;
  status: string | null;
  messages: SupportMessageView[];
};

/** How many messages the panel reads. The thread is one conversation, not a feed. */
const MESSAGE_LIMIT = 100;

/**
 * The customer's open conversation, oldest message first.
 *
 * A customer who has never written in has no ticket and no messages, which is
 * not an error: it is the empty state the topic picker fills.
 */
export async function readThread(locale: Locale): Promise<SupportThreadView> {
  const { browserApi } = await session();
  const api = browserApi();

  const { data } = await api.get("/support/tickets", { params: { limit: 20 } });
  const ticket: RawTicket | null = activeTicket(
    Array.isArray(data?.data) ? data.data : [],
  );
  if (!ticket?.ticketId) return { ticketId: null, status: null, messages: [] };

  const response = await api.get(
    `/support/tickets/${encodeURIComponent(ticket.ticketId)}/messages`,
    { params: { limit: MESSAGE_LIMIT } },
  );
  const raw: RawMessage[] = Array.isArray(response.data?.data) ? response.data.data : [];

  return {
    ticketId: ticket.ticketId,
    status: ticket.status ?? null,
    messages: chronological(raw).map((message, index) => ({
      // `_id` is the API's; the index is a fallback so a message that arrived
      // without one still renders instead of collapsing onto its neighbour.
      id: message._id ?? `${ticket.ticketId}-${index}`,
      mine: isOutgoing(message),
      text: message.message ?? "",
      time: formatTime(message.createdAt ?? undefined, locale),
      attachments: (message.attachments ?? []).filter(
        (url): url is string => typeof url === "string" && url.length > 0,
      ),
    })),
  };
}

/**
 * Sends a message, joining the open ticket or opening one.
 *
 * Returns `false` for an input with nothing in it rather than posting
 * whitespace: the server's only rule is `min 1` and it does not trim, so three
 * spaces are accepted and reach a support agent as an empty grey bubble.
 */
export async function sendMessage(draft: string): Promise<boolean> {
  const message = normalizeOutgoingMessage(draft);
  if (!message) return false;

  const { browserApi } = await session();
  await browserApi().post("/support/send-message", { message });
  return true;
}

/** Marks the customer's unread messages in this ticket read. */
export async function markRead(ticketId: string): Promise<void> {
  const { browserApi } = await session();
  await browserApi().patch(
    `/support/tickets/${encodeURIComponent(ticketId)}/read`,
  );
}
