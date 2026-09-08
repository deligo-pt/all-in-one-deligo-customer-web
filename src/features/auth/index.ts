/**
 * The auth feature's public surface.
 *
 * Deliberately small. `verify:structure` forbids reaching past this file, and
 * the reason is visible here: the flow's internals — the state machine, the
 * drawer, the device-limit dialog, the dial code — are things the rest of the
 * application should never touch, because touching them is how a second,
 * slightly different sign-in appears somewhere else in the app.
 *
 * `AuthPanel` is the flow. Both places the design shows it — the `/login`
 * screen and the drawer the header opens — render this one component;
 * *wrapping* it in a drawer is the header's business and lives in
 * `components/layout/SignInDrawer.tsx`, so a route that renders the panel as a
 * page does not also receive a dialog it never opens.
 *
 * `AuthTransport` and its companions are what Phase 15 implements — exported
 * as types so the API layer can satisfy the contract without importing any of
 * the UI.
 *
 * **Import this barrel statically only where the panel is actually wanted.**
 * One surface means one consequence: a static import hands the importer every
 * export. Twice in this phase that was measured in tens of kilobytes on routes
 * that render none of it, and both times the fix was to reach the barrel
 * through a `dynamic()` call rather than to widen the boundary.
 */
export { AuthPanel } from "./AuthPanel";
// Exported so a caller building an identifier — the states page below, the API
// layer in Phase 15 — joins the dial code the same way the form does.
export { DEFAULT_DIAL_CODE, toContactNumber } from "./countries";
export { notWiredTransport } from "./transport";
export { AuthFailure, isAuthFailure } from "./types";
export type {
  AuthFailureKind,
  AuthTransport,
  LoginIdentifier,
  OtpChannel,
  SocialProvider,
} from "./types";
export type { AuthFlowOptions, AuthMode, AuthStep } from "./useAuthFlow";
