"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_DIAL_CODE, toContactNumber } from "@/lib/countries";
import { OTP_LENGTH } from "./OtpInput";
import { notWiredTransport } from "./transport";
import {
  isAuthFailure,
  type AuthTransport,
  type LoginIdentifier,
  type OtpChannel,
  type SocialProvider,
} from "./types";

/** Which identifier the form is collecting. */
export type AuthMode = "phone" | "email";
/** Collecting the identifier, or the code that was sent to it. */
export type AuthStep = "identify" | "verify";

/**
 * The notices the flow can raise, named for the **condition** rather than for
 * the sentence that reports it.
 *
 * The hook does not translate. It cannot: it has no locale, and a hook that
 * reached for one could not be called from a Server Component's props. So it
 * names what happened and `AuthPanel` decides what to say — which is also what
 * lets `verify:i18n` see, from the source alone, that every notice has copy in
 * both languages. Naming these after dictionary keys would have put the only
 * mention of those keys in a file the guard does not scan, and the guard was
 * right to notice.
 */
export type AuthCondition =
  | "notWired"
  | "unavailable"
  | "missingPhone"
  | "missingEmail"
  | "missingCode"
  | "codeSent"
  | "socialEmailRequired"
  | "socialAlreadyLinked"
  | "socialUnavailable"
  | "socialFailed";

/** The failures with copy of their own (Phase 15). */
const SOCIAL_CONDITION = {
  "social-email-required": "socialEmailRequired",
  "social-already-linked": "socialAlreadyLinked",
  "social-unavailable": "socialUnavailable",
  "social-failed": "socialFailed",
} as const satisfies Record<string, AuthCondition>;

export type AuthNotice =
  | { kind: "error"; condition: Exclude<AuthCondition, "codeSent"> }
  /** The backend's own already-localised text. Shown verbatim; translating it
   *  again would be guessing at a string we did not write. */
  | { kind: "error"; condition: "rejected"; text: string }
  | { kind: "success"; condition: "codeSent" };

/** What is in flight. One at a time — the panel disables the rest. */
export type AuthPending = "request" | "verify" | "resend" | SocialProvider | null;

/** Seconds before "Resend code" becomes pressable again. The backend rate-limits
 *  these requests; a button that can be pressed four times a second only
 *  produces four rejections and one confused customer. */
const RESEND_COOLDOWN_SECONDS = 30;

export type AuthFlowOptions = {
  /** `AuthPanel` passes the connected one; the states page keeps this default. */
  transport?: AuthTransport;
  /** Where the flow starts. Used by the development states page to render a
   *  step the current transport cannot reach, and by nothing else. */
  initialMode?: AuthMode;
  initialStep?: AuthStep;
  /** The identifier a code was already sent to. Only the development states
   *  page passes this: the verify step is not reachable while the transport is
   *  `notWiredTransport`, and a step nobody can render is a step nobody has
   *  looked at. */
  initialSentTo?: LoginIdentifier | null;
  initialDeviceLimit?: boolean;
  /** Called once a session exists. */
  onSignedIn?: () => void;
};

export function useAuthFlow({
  transport = notWiredTransport,
  initialMode = "phone",
  initialStep = "identify",
  initialSentTo = null,
  initialDeviceLimit = false,
  onSignedIn,
}: AuthFlowOptions = {}) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [step, setStep] = useState<AuthStep>(initialStep);

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [pending, setPending] = useState<AuthPending>(null);
  const [notice, setNotice] = useState<AuthNotice | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const [deviceLimitOpen, setDeviceLimitOpen] = useState(initialDeviceLimit);
  /**
   * Whether the device-limit dialog has ever been opened.
   *
   * The panel loads that dialog lazily and needs to keep it mounted once it has
   * appeared, so that closing it plays the exit animation instead of removing
   * the element mid-transition. Tracked here, beside the state it derives
   * from, rather than reconstructed in the panel with an effect that mirrors
   * one piece of state into another — which is a cascading render and the thing
   * `react-hooks/set-state-in-effect` exists to stop.
   */
  const [deviceLimitSeen, setDeviceLimitSeen] = useState(initialDeviceLimit);

  const openDeviceLimit = useCallback((open: boolean) => {
    setDeviceLimitOpen(open);
    if (open) setDeviceLimitSeen(true);
  }, []);
  /**
   * The attempt to repeat with `forceLogin` once a session is cleared, so
   * agreeing does not send the customer back through a provider's consent
   * screen or make them ask for a second code.
   *
   * A description of the attempt, not the closure that made it. Holding the
   * function would capture the render it was created in, and by the time the
   * dialog is confirmed that closure is reading a stale `otp` — which is the
   * one value that has certainly changed, because the customer typed it.
   *
   * Only these two: requesting a code cannot exceed a device limit, because no
   * device has been registered yet.
   */
  const retryRef = useRef<
    | { type: "verify" }
    | { type: "social"; provider: SocialProvider; token: string }
    | null
  >(null);

  /** The identifier a code was actually sent to. Held separately from the two
   *  input values because the verify step must resend to the address the code
   *  went to, not to whatever the field says now. */
  const [sentTo, setSentTo] = useState<LoginIdentifier | null>(initialSentTo);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const channel: OtpChannel = sentTo?.email ? "email" : "sms";
  /**
   * What the verify step shows above the boxes: `+351 ••• ••• 482`, or the
   * email address in full.
   *
   * A phone number is masked and an address is not, which is the design's own
   * choice and the right one — the number is there to confirm *which* phone,
   * and printing all nine digits of it on a screen somebody may be holding in
   * public buys nothing. An address that is masked cannot be recognised at all.
   */
  const maskedIdentifier = sentTo?.email
    ? sentTo.email
    : sentTo?.contactNumber
      ? `${DEFAULT_DIAL_CODE} ••• ••• ${sentTo.contactNumber.slice(-3)}`
      : "";

  /**
   * Turns the form into an identifier, or names what is missing.
   *
   * Returns `null` and sets the notice rather than throwing, because "you have
   * not typed a phone number yet" is not an exceptional condition and reads
   * badly in a stack trace.
   */
  const buildIdentifier = useCallback((): LoginIdentifier | null => {
    if (mode === "email") {
      const value = email.trim().toLowerCase();
      if (!value) {
        setNotice({ kind: "error", condition: "missingEmail" });
        return null;
      }
      return { email: value };
    }

    const digits = phone.replace(/\D/g, "");
    if (!digits) {
      setNotice({ kind: "error", condition: "missingPhone" });
      return null;
    }
    return { contactNumber: toContactNumber(digits) };
  }, [email, mode, phone]);

  /**
   * The one place a failure becomes something the screen can show.
   *
   * Every path below funnels through here, which is what stops the OTP path and
   * the social path from drifting into two different ideas of what a device
   * limit looks like — the bug the old app's `completeLogin` comment warns
   * about, in its other half.
   */
  const report = useCallback((error: unknown, retry: typeof retryRef.current) => {
    if (isAuthFailure(error) && error.kind === "device-limit" && retry) {
      retryRef.current = retry;
      setDeviceLimitOpen(true);
      return;
    }
    if (isAuthFailure(error) && error.kind === "rejected") {
      setNotice({ kind: "error", condition: "rejected", text: error.message });
      return;
    }
    if (isAuthFailure(error) && error.kind in SOCIAL_CONDITION) {
      const condition = SOCIAL_CONDITION[error.kind as keyof typeof SOCIAL_CONDITION];
      setNotice({ kind: "error", condition });
      return;
    }
    // The offline states page's transport says so in its own words; anything
    // else — no answer, an unusable one, a thrown non-failure — is one
    // sentence, because a more specific one would be a guess.
    setNotice({
      kind: "error",
      condition:
        isAuthFailure(error) && error.kind === "not-wired" ? "notWired" : "unavailable",
    });
  }, []);

  const requestOtp = useCallback(
    async (kind: "request" | "resend") => {
      const identifier = kind === "resend" ? sentTo : buildIdentifier();
      if (!identifier) return;

      setNotice(null);
      setPending(kind);
      try {
        await transport.requestOtp(identifier);
        setSentTo(identifier);
        setStep("verify");
        setOtp("");
        setCooldown(RESEND_COOLDOWN_SECONDS);
        setNotice({ kind: "success", condition: "codeSent" });
      } catch (error) {
        // A code request cannot hit the device limit, so there is nothing to
        // retry with `forceLogin`.
        report(error, null);
      } finally {
        setPending(null);
      }
    },
    [buildIdentifier, report, sentTo, transport],
  );

  const verifyOtp = useCallback(
    async (forceLogin = false) => {
      if (!sentTo) return;
      const code = otp.trim();
      if (!code) {
        setNotice({ kind: "error", condition: "missingCode" });
        return;
      }

      setNotice(null);
      setPending("verify");
      try {
        await transport.verifyOtp({ identifier: sentTo, otp: code, forceLogin });
        onSignedIn?.();
      } catch (error) {
        report(error, { type: "verify" });
      } finally {
        setPending(null);
      }
    },
    [onSignedIn, otp, report, sentTo, transport],
  );

  const signInWith = useCallback(
    async (provider: SocialProvider, token: string, forceLogin = false) => {
      setNotice(null);
      setPending(provider);
      try {
        await transport.socialLogin({ provider, token, forceLogin });
        onSignedIn?.();
      } catch (error) {
        report(error, { type: "social", provider, token });
      } finally {
        setPending(null);
      }
    },
    [onSignedIn, report, transport],
  );

  /** Switching tabs abandons the attempt in progress. It has to: the code was
   *  sent to a phone and the field now holds an email. */
  const changeMode = useCallback((next: AuthMode) => {
    setMode(next);
    setStep("identify");
    setOtp("");
    setSentTo(null);
    setNotice(null);
    setCooldown(0);
  }, []);

  const backToIdentify = useCallback(() => {
    setStep("identify");
    setOtp("");
    setNotice(null);
  }, []);

  const clearSessionAndRetry = useCallback(() => {
    setDeviceLimitOpen(false);
    const retry = retryRef.current;
    retryRef.current = null;
    if (!retry) return;
    if (retry.type === "verify") void verifyOtp(true);
    else void signInWith(retry.provider, retry.token, true);
  }, [signInWith, verifyOtp]);

  return useMemo(
    () => ({
      mode,
      step,
      phone,
      email,
      otp,
      pending,
      notice,
      cooldown,
      channel,
      maskedIdentifier,
      deviceLimitOpen,
      deviceLimitSeen,
      setPhone,
      setEmail,
      // `OTP_LENGTH` digits, digits only. Typing one more does nothing rather
      // than silently replacing the first, and a pasted "code: 8417" still works.
      setOtp: (value: string) => setOtp(value.replace(/\D/g, "").slice(0, OTP_LENGTH)),
      setDeviceLimitOpen: openDeviceLimit,
      changeMode,
      backToIdentify,
      sendCode: () => requestOtp("request"),
      resendCode: () => requestOtp("resend"),
      verifyOtp: () => verifyOtp(),
      signInWith,
      /** A provider's SDK could not produce a token. */
      socialUnavailable: () =>
        setNotice({ kind: "error", condition: "socialUnavailable" }),
      /** Marks a provider as in flight while its own dialog is open. */
      setPending,
      clearSessionAndRetry,
    }),
    [
      backToIdentify,
      changeMode,
      channel,
      clearSessionAndRetry,
      cooldown,
      deviceLimitOpen,
      deviceLimitSeen,
      email,
      openDeviceLimit,
      mode,
      maskedIdentifier,
      notice,
      otp,
      pending,
      phone,
      requestOtp,
      signInWith,
      step,
      verifyOtp,
    ],
  );
}

export type AuthFlow = ReturnType<typeof useAuthFlow>;
