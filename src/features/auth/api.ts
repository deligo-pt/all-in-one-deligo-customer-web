import { readTokens } from "@/lib/session";
import { isApiError } from "@/services/api/error";
import {
  AuthFailure,
  type AuthFailureKind,
  type AuthTransport,
  type LoginIdentifier,
} from "./types";

/** The API client and axios arrive with the first submit, not with the panel:
 *  `/login` and the drawer render long before anyone presses anything. */
const session = () => import("@/services/session/browser");

/**
 * The transport Phase 15 ships: the three auth endpoints through the one API
 * client, every failure turned into an `AuthFailure` the panel can act on.
 */

/** Branches on `errorKey` only. `LIMIT_EXCEEDED`'s own message reads "Request
 *  limit exceeded", which is misleading; the social keys are developer-facing. */
const KNOWN: Record<string, AuthFailureKind> = {
  LIMIT_EXCEEDED: "device-limit",
  SOCIAL_EMAIL_REQUIRED: "social-email-required",
  SOCIAL_ACCOUNT_ALREADY_LINKED: "social-already-linked",
  GOOGLE_CONFIGURATION_MISSING: "social-unavailable",
  FACEBOOK_CONFIGURATION_MISSING: "social-unavailable",
  INVALID_SOCIAL_TOKEN: "social-failed",
};

export function toAuthFailure(error: unknown): AuthFailure {
  if (error instanceof AuthFailure) return error;
  if (!isApiError(error) || error.network) return new AuthFailure("unavailable");
  const kind = error.errorKey ? KNOWN[error.errorKey] : undefined;
  if (kind) return new AuthFailure(kind);
  return error.message && error.message !== error.errorKey
    ? new AuthFailure("rejected", error.message)
    : new AuthFailure("unavailable");
}

/** Both sign-in responses carry `{ accessToken, refreshToken }`; anything else
 *  is not a session, however `success: true` it says it is. */
async function complete(body: unknown): Promise<void> {
  const tokens = readTokens((body as { data?: unknown } | undefined)?.data);
  if (!tokens?.refreshToken) throw new AuthFailure("unavailable");
  await (await session()).saveSession(tokens);
  // After the session exists, never before: a device that fails to sign in has
  // nothing to register, and a permission prompt for it would be a question
  // asked for nothing.
  void import("./push").then(async ({ registerPushToken, requestPushToken }) => {
    const token = await requestPushToken();
    if (token) await registerPushToken(token);
  });
}

function identify(identifier: LoginIdentifier) {
  return identifier.email
    ? { email: identifier.email }
    : { contactNumber: identifier.contactNumber };
}

async function call(run: () => Promise<unknown>): Promise<void> {
  try {
    await run();
  } catch (error) {
    throw toAuthFailure(error);
  }
}

export const apiAuthTransport: AuthTransport = {
  requestOtp(identifier) {
    return call(async () =>
      (await session()).browserApi().post("/auth/login-customer", {
        ...identify(identifier),
        ...(identifier.referralCode ? { referralCode: identifier.referralCode } : {}),
      }),
    );
  },
  verifyOtp({ identifier, otp, forceLogin }) {
    return call(async () => {
      const { browserApi, deviceDetails } = await session();
      const { data } = await browserApi().post("/auth/verify-otp", {
        ...identify(identifier),
        otp,
        role: "CUSTOMER",
        deviceDetails: deviceDetails(),
        ...(forceLogin ? { forceLogin: true } : {}),
      });
      await complete(data);
    });
  },
  socialLogin({ provider, token, forceLogin }) {
    return call(async () => {
      const { browserApi, deviceDetails } = await session();
      const { data } = await browserApi().post("/auth/social-login", {
        provider,
        token,
        deviceDetails: deviceDetails(),
        ...(forceLogin ? { forceLogin: true } : {}),
      });
      await complete(data);
    });
  },
};
