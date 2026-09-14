import { ACCESS_TOKEN_COOKIE } from "@/lib/session";

/**
 * Whether this browser holds a session — read from the access cookie, with no
 * network and no axios, so the header on every route can ask cheaply.
 */
export const SESSION_EVENT = "deligo:session";

export function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]!) : undefined;
}

export function hasSession(): boolean {
  return Boolean(readCookie(ACCESS_TOKEN_COOKIE));
}

/** Tell every `useSession` in the page that the cookie changed. */
export function announceSessionChange(): void {
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function subscribeSession(onChange: () => void): () => void {
  window.addEventListener(SESSION_EVENT, onChange);
  document.addEventListener("visibilitychange", onChange);
  return () => {
    window.removeEventListener(SESSION_EVENT, onChange);
    document.removeEventListener("visibilitychange", onChange);
  };
}
