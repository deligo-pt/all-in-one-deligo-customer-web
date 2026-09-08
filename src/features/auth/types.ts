/**
 * The shape of everything the sign-in flow needs from the outside world.
 *
 * Phase 6 builds the screens; Phase 15 connects them. This file is the seam
 * between the two, and it is written now rather than then so the UI is built
 * against a contract instead of against whatever the API turns out to look
 * like. The old app proved the endpoints exist and what they answer with —
 * `/auth/login-customer`, `/auth/verify-otp`, `/auth/social-login` (Plan.md
 * §2.2) — so this is a transcription of a known contract, not a guess.
 *
 * Nothing here talks to Google or Facebook either. Their SDKs hand back a
 * token; the token is exchanged with **our** backend. `socialLogin` therefore
 * takes a provider and not a token — obtaining one is the transport's problem,
 * because it is the half that changes when a provider changes its SDK.
 */

/** The two providers the design offers. Upper case because that is what the
 *  backend's `provider` field takes. */
export type SocialProvider = "GOOGLE" | "FACEBOOK";

/**
 * Who is signing in — a phone number or an email address, never both.
 *
 * A union rather than two optional fields, so a call site cannot send an
 * identifier with neither set and discover it at the API. `contactNumber`
 * carries the dial code already joined on; see `countries.ts` for why that
 * happens at the edge of the form rather than at the edge of the request.
 */
export type LoginIdentifier =
  | {
      readonly contactNumber: string;
      readonly email?: never;
      readonly referralCode?: string;
    }
  | {
      readonly email: string;
      readonly contactNumber?: never;
      readonly referralCode?: string;
    };

/** Which channel a code was sent down. Derived from the identifier, kept as its
 *  own type because the copy on the verify step differs: an SMS names the
 *  network it arrived on, an email has a spam folder to warn about. */
export type OtpChannel = "sms" | "email";

/**
 * Why an attempt failed, in terms the UI can act on.
 *
 * `kind` and not a status code or a message. The old app learned this twice:
 * a `401` means both "your session ended" and "that code was wrong", and the
 * human-readable text for the device limit reads "Request limit exceeded",
 * which is misleading copy that no branch should ever have depended on.
 *
 *  - `not-wired`    — Phase 15 has not connected this yet. Track B's answer.
 *  - `device-limit` — the account is signed in on too many devices. The only
 *                     failure with a way forward: clear a session and retry
 *                     with `forceLogin`.
 *  - `rejected`     — the backend said no. `message` is its own already
 *                     localised text and is shown verbatim.
 */
export type AuthFailureKind = "not-wired" | "device-limit" | "rejected";

export class AuthFailure extends Error {
  readonly kind: AuthFailureKind;

  constructor(kind: AuthFailureKind, message?: string) {
    super(message ?? kind);
    this.name = "AuthFailure";
    this.kind = kind;
  }
}

export function isAuthFailure(error: unknown): error is AuthFailure {
  return error instanceof AuthFailure;
}

/**
 * What Phase 15 implements.
 *
 * Every method either resolves or throws an `AuthFailure`. There is no
 * `{ ok: false }` result type: a failed sign-in is exceptional, the UI has one
 * place that catches it, and a result type would put a branch at every call
 * site that would eventually be forgotten at one of them.
 *
 * `forceLogin` appears on the two calls that can hit the device limit, and only
 * on those. It is a retry of the exact same request after the customer has
 * agreed to end another session — never a first attempt.
 */
export type AuthTransport = {
  /** `POST /auth/login-customer` — sends the one-time code. */
  requestOtp(identifier: LoginIdentifier): Promise<void>;
  /** `POST /auth/verify-otp` — exchanges the code for a session. */
  verifyOtp(input: {
    identifier: LoginIdentifier;
    otp: string;
    forceLogin?: boolean;
  }): Promise<void>;
  /** `POST /auth/social-login` — exchanges a provider token for a session. */
  socialLogin(input: { provider: SocialProvider; forceLogin?: boolean }): Promise<void>;
};
