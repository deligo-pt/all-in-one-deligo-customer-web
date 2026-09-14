"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/cn";
import { withLocale } from "@/lib/i18n/path";
import { ROUTES } from "@/lib/routes";
import { safeNextPath } from "@/lib/session";
import { apiAuthTransport } from "./api";
import { facebookLogin, loadFacebookSdk } from "./facebookSdk";
import { GoogleSlot } from "./GoogleSlot";
import { notWiredTransport } from "./transport";
import type { MessageKey } from "@/i18n/namespaces";
import { BrandMark } from "./BrandMark";
import { OtpInput, OTP_LENGTH } from "./OtpInput";
import { DEFAULT_DIAL_CODE } from "./countries";
import { useAuthFlow, type AuthCondition, type AuthFlowOptions } from "./useAuthFlow";

/**
 * The device-limit dialog arrives when it is needed, not when the page is.
 *
 * It is a Radix Dialog — a focus trap, a portal, an inert background — and it
 * is shown only to a customer already signed in on the maximum number of
 * devices. Measured on `/login`: loading it eagerly is most of what put the
 * route over the first-load budget, for a state most people never reach.
 */
const DeviceLimitDialog = dynamic(
  () => import("./DeviceLimitDialog").then((m) => m.DeviceLimitDialog),
  { ssr: false },
);

/**
 * Which sentence reports each condition.
 *
 * Written out rather than derived. The flow names conditions and this file owns
 * copy, so the mapping has to exist somewhere and this is the honest place for
 * it — and `verify:i18n` reads the source to decide which dictionary keys are
 * actually rendered, so a key reachable only through a variable is one it
 * cannot see, and one that can be dropped from Portuguese unnoticed.
 */
const NOTICE_MESSAGE = {
  notWired: "notWired",
  unavailable: "signInUnavailable",
  missingPhone: "phoneRequired",
  missingEmail: "emailRequired",
  missingCode: "otpRequired",
  codeSent: "codeSent",
  socialEmailRequired: "socialEmailRequired",
  socialAlreadyLinked: "socialAlreadyLinked",
  socialUnavailable: "socialUnavailable",
  socialFailed: "socialFailed",
} as const satisfies Record<AuthCondition, MessageKey<"auth">>;

/** Public identifiers, inlined at build. Empty leaves the design's button in
 *  place, reporting the option unavailable. */
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID;
const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID ?? "";

/**
 * The sign-in flow, entire.
 *
 * One component renders both places this appears: the drawer that opens over
 * any page — which is what the design draws, four times — and the `/login`
 * screen a direct link lands on. The one reliable way to keep two copies of a
 * flow identical is to not have two.
 *
 * ## Measured from the four auth frames
 *
 * `phn login`, `email`, `phn otp`, `email otp` — each a 1440px frame showing a
 * 704px drawer. Content column 371px, centred, 24px between blocks. Title
 * 40/600 `ink`, subtitle 16/400 `ink-muted`, both centred. The primary button
 * is 51px tall at 8px radius and sized to its label, not to the column.
 * Provider buttons are the full column at 48px, 12px radius, `surface-muted`.
 *
 * ## There are no tabs
 *
 * An earlier version put Mobile/Email in a Radix tab bar. The design does not:
 * phone is the default, and **email is the third provider button** — "Continue
 * with Email" sits under Google and Facebook, and the email screen offers
 * "Continue with Phone" back. That is one control doing one job, it is what
 * the file draws, and it removed 9 KB of tab machinery from `/login`.
 *
 * ## The steps are state, not routes
 *
 * `/login/verify` would be a URL that can be opened with no identifier behind
 * it — a page that can only apologise. Only the start is addressable.
 *
 * ## Connected (Phase 15)
 *
 * Submits go through `apiAuthTransport`. `offline` keeps the not-wired
 * transport for the development states page, which must never send a code.
 * After a session exists, `/login` goes to `?next=` (or home) and the drawer
 * refreshes the page it is open over.
 */
export function AuthPanel({
  className,
  offline = false,
  onSignedIn,
  ...options
}: Omit<AuthFlowOptions, "transport"> & { className?: string; offline?: boolean }) {
  const { t, locale } = useTranslation("auth");
  const { t: common } = useTranslation("common");
  const router = useRouter();
  const flow = useAuthFlow({
    ...options,
    transport: offline ? notWiredTransport : apiAuthTransport,
    onSignedIn: () => {
      onSignedIn?.();
      if (window.location.pathname === withLocale(ROUTES.login.path, locale)) {
        const next = safeNextPath(
          new URLSearchParams(window.location.search).get("next"),
        );
        router.replace(next ?? withLocale("/", locale));
      }
      router.refresh();
    },
  });

  // Loaded before the button is pressed: `FB.login` must run inside the click.
  useEffect(() => {
    if (!offline) loadFacebookSdk(FACEBOOK_APP_ID, locale).catch(() => undefined);
  }, [locale, offline]);

  const startFacebook = () => {
    if (offline) return void flow.signInWith("FACEBOOK", "");
    flow.setPending("FACEBOOK");
    facebookLogin()
      .then((token) => {
        flow.setPending(null);
        // Cancelled is the customer's choice, and says nothing.
        if (token) void flow.signInWith("FACEBOOK", token);
      })
      .catch(() => {
        flow.setPending(null);
        flow.socialUnavailable();
      });
  };

  const busy = flow.pending !== null;
  const identifying = flow.step === "identify";
  const onPhone = flow.mode === "phone";

  return (
    <div
      className={cn(
        // 371px is the measured column. It sits centred in a 704px drawer and
        // takes the full width of a phone, which is the only case the design
        // does not draw (D-8).
        "mx-auto flex w-full max-w-[23.1875rem] flex-col gap-6 text-center",
        className,
      )}
    >
      <div className="flex flex-col gap-2">
        <h2 className="text-40 text-ink font-semibold">
          {identifying ? (
            <>
              {t("welcomeTitle")}{" "}
              {/* The name is never translated and never re-cased — it comes
                  from `common`, the same place the header's wordmark reads. */}
              <span className="text-brand">{common("appName")}</span>
            </>
          ) : (
            t("verifyTitle")
          )}
        </h2>
        <p className="text-16 text-ink-muted">
          {identifying
            ? t("welcomeSubtitle")
            : flow.channel === "sms"
              ? t("verifySubtitlePhone", { length: OTP_LENGTH })
              : t("verifySubtitleEmail", { length: OTP_LENGTH })}
        </p>
      </div>

      {/* One region, announced when it changes. Two — an error box and a
          success box — is two things a screen reader has to watch, and only
          ever one of them is populated. */}
      <div role="status" aria-live="polite" className="empty:hidden">
        {flow.notice ? (
          <p
            className={cn(
              "text-14 rounded-12 px-4 py-3 font-medium",
              flow.notice.kind === "error"
                ? "bg-brand-tint text-brand-strong"
                : "text-success bg-surface-muted",
            )}
          >
            {flow.notice.condition === "rejected"
              ? flow.notice.text
              : // `{length}` is only in `otpRequired`; other messages ignore it.
                t(NOTICE_MESSAGE[flow.notice.condition], { length: OTP_LENGTH })}
          </p>
        ) : null}
      </div>

      {/* A real form, so Enter submits and password managers and SMS autofill
          recognise what they are looking at. */}
      <form
        className="flex flex-col items-center gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          if (identifying) void flow.sendCode();
          else void flow.verifyOtp();
        }}
      >
        {identifying ? (
          <Field
            label={onPhone ? t("phoneLabel") : t("emailLabel")}
            className="w-full items-start gap-4"
          >
            {(ids) =>
              onPhone ? (
                // Measured: a 99px dial box and a 272px number box, sharing an
                // edge, rounded 16 on the outside only — one control as far as
                // the API is concerned, and `countries.ts` joins the halves.
                <div className="flex w-full">
                  <span className="text-16 text-ink border-brand-soft rounded-s-16 flex h-14 items-center justify-center border px-6 font-medium">
                    {DEFAULT_DIAL_CODE}
                  </span>
                  <Input
                    {...ids}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    name="phone"
                    value={flow.phone}
                    onChange={(event) => flow.setPhone(event.target.value)}
                    placeholder={t("phonePlaceholder")}
                    className="border-brand-soft rounded-s-none rounded-e-16 -ms-px flex-1"
                  />
                </div>
              ) : (
                <Input
                  {...ids}
                  type="email"
                  autoComplete="email"
                  name="email"
                  value={flow.email}
                  onChange={(event) => flow.setEmail(event.target.value)}
                  placeholder={t("emailPlaceholder")}
                  className="border-brand-soft rounded-16 w-full"
                />
              )
            }
          </Field>
        ) : (
          <>
            {/* The identifier the code went to, and the way back. The chip is
                not a control — it is the answer to "which number?" — so the
                only thing pressable beside it is the link that changes it. */}
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-14 text-ink bg-line-subtle rounded-8 inline-flex items-center gap-2 px-4 py-2">
                <Icon
                  name={flow.channel === "sms" ? "phone" : "email"}
                  className="size-4"
                />
                {flow.maskedIdentifier}
              </span>
              <Button variant="link" onClick={flow.backToIdentify} disabled={busy}>
                {flow.channel === "sms" ? t("changePhone") : t("changeEmail")}
              </Button>
            </div>

            <Field label={t("codeLabel")} className="items-center gap-4">
              {(ids) => (
                <OtpInput
                  id={ids.id}
                  describedBy={ids["aria-describedby"]}
                  label={t("codeLabel")}
                  value={flow.otp}
                  onChange={flow.setOtp}
                  disabled={busy}
                />
              )}
            </Field>
          </>
        )}

        {/* 51px tall, 8px radius, sized to its label. Not the full column —
            the design gives the width to the providers below, and a primary
            action that is the same width as three secondary ones stops
            reading as the primary one. */}
        <Button
          type="submit"
          className="rounded-8 h-13 px-10"
          loading={flow.pending === "request" || flow.pending === "verify"}
          disabled={busy || (!identifying && flow.otp.length < OTP_LENGTH)}
        >
          {identifying ? t("continueWithOtp") : t("verifyOtp")}
        </Button>

        {identifying ? null : (
          <Button
            variant="link"
            disabled={busy || flow.cooldown > 0}
            loading={flow.pending === "resend"}
            onClick={() => void flow.resendCode()}
          >
            {flow.cooldown > 0
              ? t("resendIn", { seconds: flow.cooldown })
              : t("resendCode")}
          </Button>
        )}
      </form>

      {/* Providers belong to the start of the flow only. Once a code has been
          requested the customer is mid-task, and offering another way to begin
          is an invitation to lose the one they are in. */}
      {identifying ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 py-2">
            <span aria-hidden className="bg-line h-px flex-1" />
            <span className="text-12 text-ink-muted font-semibold">{t("or")}</span>
            <span aria-hidden className="bg-line h-px flex-1" />
          </div>

          <div className="flex flex-col gap-3">
            <GoogleSlot
              clientId={offline ? undefined : GOOGLE_CLIENT_ID}
              locale={locale}
              onCredential={(token) => void flow.signInWith("GOOGLE", token)}
              onUnavailable={flow.socialUnavailable}
              fallback={
                <Button
                  variant="secondary"
                  block
                  className="rounded-12 text-14 h-12 font-normal"
                  disabled={busy}
                  loading={flow.pending === "GOOGLE"}
                  startIcon={<BrandMark provider="GOOGLE" className="size-5" />}
                  onClick={() =>
                    offline
                      ? void flow.signInWith("GOOGLE", "")
                      : flow.socialUnavailable()
                  }
                >
                  {t("continueWithGoogle")}
                </Button>
              }
            />
            <Button
              variant="secondary"
              block
              className="rounded-12 text-14 h-12 font-normal"
              disabled={busy}
              loading={flow.pending === "FACEBOOK"}
              startIcon={<BrandMark provider="FACEBOOK" className="size-5" />}
              onClick={startFacebook}
            >
              {t("continueWithFacebook")}
            </Button>
            {/* The mode switch, and the reason there is no tab bar: the design
                puts "the other way to identify yourself" in the same list as
                the other ways to identify yourself. */}
            <Button
              variant="secondary"
              block
              className="rounded-12 text-14 h-12 font-normal"
              disabled={busy}
              startIcon={<Icon name={onPhone ? "email" : "phone"} className="size-5" />}
              onClick={() => flow.changeMode(onPhone ? "email" : "phone")}
            >
              {onPhone ? t("continueWithEmail") : t("continueWithPhone")}
            </Button>
          </div>
        </div>
      ) : null}

      <p className="text-14 text-ink">
        {t("termsIntro")}{" "}
        <Link
          href={withLocale(ROUTES.terms.path, locale)}
          className="text-brand underline-offset-4 hover:underline"
        >
          {t("termsOfService")}
        </Link>{" "}
        {t("and")}{" "}
        <Link
          href={withLocale(ROUTES.privacy.path, locale)}
          className="text-brand underline-offset-4 hover:underline"
        >
          {t("privacyPolicy")}
        </Link>
      </p>

      {/* Mounted from the first time it opened, and kept: unmounting on close
          removes the element mid-transition. */}
      {flow.deviceLimitSeen ? (
        <DeviceLimitDialog
          open={flow.deviceLimitOpen}
          onOpenChange={flow.setDeviceLimitOpen}
          onConfirm={flow.clearSessionAndRetry}
        />
      ) : null}
    </div>
  );
}
