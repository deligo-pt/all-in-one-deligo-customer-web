import type { AxiosInstance } from "axios";
import {
  ACCESS_TOKEN_COOKIE,
  DEVICE_ID_STORAGE_KEY,
  type SessionTokens,
} from "@/lib/session";
import { createApiClient } from "@/services/api/client";
import { announceSessionChange, readCookie } from "./state";

/**
 * The browser's half of the session: the API client page code uses, and the
 * three things that change a session — save, refresh, end. Cookies are written
 * only by `/api/session`; nothing here touches `document.cookie` for writing.
 */

function currentLocale(): string {
  return document.documentElement.lang.slice(0, 2) || "pt";
}

let refreshing: Promise<boolean> | null = null;

/** One refresh at a time: ten requests failing together share one attempt. */
export function refreshSession(): Promise<boolean> {
  refreshing ??= fetch("/api/session/refresh", { method: "POST" })
    .then((r) => r.ok)
    .catch(() => false)
    .finally(() => {
      refreshing = null;
      announceSessionChange();
    });
  return refreshing;
}

function sendToLogin(): void {
  const locale = currentLocale();
  const next = `${window.location.pathname}${window.location.search}`;
  // A full navigation, not a router push: this runs outside React, and every
  // piece of in-memory state belongs to a session that no longer exists.
  const login = new URL(`/${locale}/login`, window.location.origin);
  login.searchParams.set("next", next);
  window.location.assign(login.href);
}

let client: AxiosInstance | null = null;

/** Created on first use: a missing base URL fails the request, not the page. */
export function browserApi(): AxiosInstance {
  client ??= createApiClient({
    getAccessToken: () => readCookie(ACCESS_TOKEN_COOKIE),
    getLocale: currentLocale,
    refresh: refreshSession,
    onSessionEnded: () => {
      void fetch("/api/session", { method: "DELETE" }).finally(sendToLogin);
    },
  });
  return client;
}

export async function saveSession(tokens: SessionTokens): Promise<void> {
  const response = await fetch("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tokens),
  });
  if (!response.ok) throw new Error("session-not-saved");
  announceSessionChange();
}

/**
 * Signs out: frees this device's slot on the account (`/auth/logout` — the
 * old app never called it, so every browser sign-out used one of the three
 * device slots until the token died), then clears the cookies. The API call is
 * best-effort; the local sign-out is not.
 */
export async function endSession(): Promise<void> {
  try {
    await browserApi().post(
      "/auth/logout",
      { deviceId: deviceId() },
      { timeout: 5_000 },
    );
  } catch {
    // An expired session cannot be logged out of; clearing it locally still is.
  }
  await fetch("/api/session", { method: "DELETE" }).catch(() => undefined);
  announceSessionChange();
}

export function deviceId(): string {
  try {
    const existing = localStorage.getItem(DEVICE_ID_STORAGE_KEY);
    if (existing) return existing;
    const created = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_STORAGE_KEY, created);
    return created;
  } catch {
    return "unknown";
  }
}

export type DeviceDetails = {
  deviceId: string;
  deviceType: string;
  deviceName: string;
  fcmToken: string;
  isLoggedIn: true;
  userAgent: string;
};

export function deviceDetails(fcmToken = ""): DeviceDetails {
  const userAgent = navigator.userAgent;
  const ua = userAgent.toLowerCase();
  const platform =
    (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData
      ?.platform ??
    navigator.platform ??
    "";
  return {
    deviceId: deviceId(),
    deviceType: ua.includes("tablet")
      ? "tablet"
      : ua.includes("mobi")
        ? "mobile"
        : "desktop",
    deviceName: platform,
    fcmToken,
    isLoggedIn: true,
    userAgent,
  };
}
