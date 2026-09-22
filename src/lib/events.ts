/**
 * The names of the browser events this app dispatches to itself.
 *
 * They live in `lib/` — pure, no imports — because the two ends are always in
 * different corners of the app: the cart's transport announces a write, the
 * **header** listens; the push listener announces a message, the **header**
 * listens. Putting either name in a feature barrel would drag that feature's
 * views into the header, and the header is on every page. This project has
 * paid for that lesson three times (27 KB, 9.3 KB, 11 KB).
 *
 * Why events at all: the counts are read by a client component that otherwise
 * only re-reads when the path changes. Adding a dish happens on the page you
 * are already on, so nothing changed the path and the basket stayed a step
 * behind until a reload — the bug this file exists to fix.
 */

/** A cart write succeeded: add, quantity, add-on, removal, store choice. */
export const CART_EVENT = "deligo:cart";

/** A push message arrived — in this tab, or in the service worker. */
export const PUSH_EVENT = "deligo:push";

/**
 * Open the support chat, optionally with a sentence already typed.
 *
 * The panel is mounted once in the locale layout so that opening support never
 * navigates: a customer stuck on checkout asks their question from checkout,
 * and the page they were on is still there behind the dialog. The openers are
 * scattered — a payment failure, a topic row, a help page — and none of them
 * owns the panel, which is what this event is for.
 *
 * `detail` carries `{ prefill?: string }`. It is a browser event rather than a
 * store for the reason stated at the top of this file: a store would live in a
 * module the layout imports on every page, and the panel it belongs to must
 * not.
 */
export const SUPPORT_EVENT = "deligo:support";

/** What {@link SUPPORT_EVENT} carries. */
export type SupportIntent = { prefill?: string };
