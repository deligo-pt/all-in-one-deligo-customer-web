import { ROUTES } from "@/lib/routes";

/**
 * `/firebase-messaging-sw.js` — the push service worker (Phase 15).
 *
 * Generated rather than committed to `public/`, so the Firebase config comes
 * from the environment instead of being pasted into a file per deployment (the
 * old app's worker carried two projects' configs, one commented out). Showing
 * background notifications is all it does; what the page does with one in the
 * foreground is Phase 19. The compat SDK version tracks `package.json`.
 */
const SDK = "12.19.0";

export const dynamic = "force-static";

export function GET() {
  const config = JSON.stringify({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  });
  const orderPath = JSON.stringify(ROUTES.order.path);

  const script = `importScripts("https://www.gstatic.com/firebasejs/${SDK}/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/${SDK}/firebase-messaging-compat.js");
firebase.initializeApp(${config});
firebase.messaging().onBackgroundMessage((payload) => {
  const data = payload.data || {};
  const title = (payload.notification && payload.notification.title) || data.title || "DeliGo";
  const body = (payload.notification && payload.notification.body) || data.body || "";
  const url = data.orderId ? ${orderPath}.replace("[orderId]", encodeURIComponent(data.orderId)) : "/";
  return self.registration.showNotification(title, {
    body,
    icon: "/logo.svg",
    tag: data.orderId || "deligo",
    data: { url },
  });
});
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(clients.openWindow(url));
});
`;
  return new Response(script, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Service-Worker-Allowed": "/",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
