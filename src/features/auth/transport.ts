import { AuthFailure, type AuthTransport } from "./types";

/**
 * The transport Track B ships with: every call fails, honestly.
 *
 * Plan.md's rule for a screen whose backend is not connected is that nothing is
 * faked — no invented success, no placeholder session, no "logged in" state
 * that evaporates on reload. That rule cost the previous project real money
 * once, and it applies to a flow that is *not yet wired* exactly as it applies
 * to a vertical that has no endpoint at all.
 *
 * So this rejects with `not-wired`, the panel renders the notice that says so,
 * and the form beneath it stays a real form: real validation, real autofill,
 * real Enter key, real focus movement. On the day Phase 15 swaps this module's
 * export for the axios implementation, nothing above it changes.
 *
 * The states the customer cannot reach through this transport — the verify
 * step, the device-limit dialog — are reviewable at `/auth-states`, which is a
 * development page and prerenders as a 404 in production.
 */
export const notWiredTransport: AuthTransport = {
  requestOtp() {
    return Promise.reject(new AuthFailure("not-wired"));
  },
  verifyOtp() {
    return Promise.reject(new AuthFailure("not-wired"));
  },
  socialLogin() {
    return Promise.reject(new AuthFailure("not-wired"));
  },
};
