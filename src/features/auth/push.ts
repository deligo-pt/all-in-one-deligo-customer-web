import {
  FIREBASE_CONFIG as CONFIG,
  VAPID_KEY,
  pushConfigured,
} from "@/services/push/config";
/**
 * Push registration (Phase 15): a token for this browser, sent to
 * `/auth/update-fcm-token` against this device's id. Showing and routing the
 * notifications themselves is Phase 19.
 *
 * Firebase is imported only here, only after a sign-in, so its weight never
 * reaches a page load. Every failure — no config, no support, permission
 * refused, a push service blocked by the browser — is `null`: a customer
 * without notifications is still signed in.
 */

export async function requestPushToken(): Promise<string | null> {
  if (!pushConfigured()) return null;
  if (!("serviceWorker" in navigator) || !("Notification" in window)) return null;
  try {
    const { isSupported, getMessaging, getToken } = await import("firebase/messaging");
    if (!(await isSupported())) return null;
    if ((await Notification.requestPermission()) !== "granted") return null;
    const { initializeApp, getApps, getApp } = await import("firebase/app");
    const app = getApps().length ? getApp() : initializeApp(CONFIG);
    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
    );
    await navigator.serviceWorker.ready;
    return (
      (await getToken(getMessaging(app), {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration,
      })) || null
    );
  } catch {
    return null;
  }
}

export async function registerPushToken(token: string): Promise<void> {
  try {
    const { browserApi, deviceId } = await import("@/services/session/browser");
    await browserApi().post("/auth/update-fcm-token", { token, deviceId: deviceId() });
  } catch {
    // Registration is best-effort; the next sign-in tries again.
  }
}
