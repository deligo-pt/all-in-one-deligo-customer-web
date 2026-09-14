"use client";

import { useSyncExternalStore } from "react";
import { hasSession, subscribeSession } from "@/services/session/state";

/**
 * Whether this browser is signed in: `true`, `false`, or `null` while that is
 * not knowable (the server render and the first client paint, which must
 * agree). Re-reads when a sign-in or sign-out announces itself and when the
 * tab comes back into view.
 */
export function useSession(): boolean | null {
  return useSyncExternalStore(subscribeSession, hasSession, () => null);
}
