import { FIREBASE_CONFIG, pushConfigured } from "./config";

export type ForegroundMessage = { title?: string; body?: string };

/**
 * Push messages that arrive while a page is open (Phase 19). Background ones
 * are shown by `/firebase-messaging-sw.js`; a page in front receives them here
 * instead, and the browser shows nothing unless the page does.
 *
 * Listens only when this browser already granted permission — it never asks
 * (sign-in asks, Phase 15) — and Firebase loads only then. Resolves the
 * unsubscribe, or nothing when there is nothing to listen to.
 */
export async function onForegroundMessage(
  handler: (message: ForegroundMessage) => void,
): Promise<(() => void) | undefined> {
  if (!pushConfigured() || !("Notification" in window)) return undefined;
  if (Notification.permission !== "granted") return undefined;
  try {
    const { isSupported, getMessaging, onMessage } = await import("firebase/messaging");
    if (!(await isSupported())) return undefined;
    const { initializeApp, getApps, getApp } = await import("firebase/app");
    const app = getApps().length ? getApp() : initializeApp(FIREBASE_CONFIG);
    return onMessage(getMessaging(app), (payload) =>
      handler({ title: payload.notification?.title, body: payload.notification?.body }),
    );
  } catch {
    return undefined;
  }
}
