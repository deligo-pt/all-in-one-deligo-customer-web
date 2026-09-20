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
