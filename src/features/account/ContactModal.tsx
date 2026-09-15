"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { DEFAULT_DIAL_CODE, isNationalNumber, toContactNumber } from "@/lib/countries";
import { accountApi } from "./api";

export type ContactCopy = {
  title: string;
  body: string;
  close: string;
  email: string;
  phone: string;
  newEmail: string;
  newPhone: string;
  phoneHelp: string;
  invalidPhone: string;
  sendCode: string;
  code: string;
  codeSent: string;
  confirm: string;
  actionFailed: string;
};

/**
 * Changing the email or phone — the old app's two-step flow: a code is sent to
 * the **new** address (`PATCH /profile/send-otp` with `email` or
 * `contactNumber`), and the change happens when that code comes back
 * (`PATCH /profile/update-email-or-contact-number` with `type`). Nothing
 * changes until the code is confirmed.
 */
export function ContactModal({
  open,
  onOpenChange,
  onSaved,
  offlineNotice,
  copy,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
  offlineNotice?: string;
  copy: ContactCopy;
}) {
  const [type, setType] = useState<"email" | "mobile">("email");
  const [value, setValue] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function run(call: () => Promise<void>) {
    if (offlineNotice) return setNotice(offlineNotice);
    setBusy(true);
    setNotice(null);
    try {
      await call();
    } catch (error) {
      setNotice(
        error instanceof Error && error.message ? error.message : copy.actionFailed,
      );
    } finally {
      setBusy(false);
    }
  }

  const sendCode = () => {
    // The old app's rule: a mobile is the fixed dial code and nine digits,
    // checked before a code is sent to a number that cannot receive one.
    if (type === "mobile" && !isNationalNumber(value))
      return setNotice(copy.invalidPhone);
    return run(async () => {
      await accountApi.sendContactCode(
        type === "email"
          ? { email: value.trim() }
          : { contactNumber: toContactNumber(value) },
      );
      setSent(true);
    });
  };

  const confirm = () =>
    run(async () => {
      await accountApi.confirmContact(otp.trim(), type);
      onSaved();
    });

  return (
    <Modal
      open={open}
      onOpenChange={(next) => !busy && onOpenChange(next)}
      title={copy.title}
      description={copy.body}
      closeLabel={copy.close}
      className="w-[min(32rem,calc(100vw-2rem))]"
    >
      <div role="radiogroup" aria-label={copy.title} className="grid grid-cols-2 gap-2">
        {(["email", "mobile"] as const).map((option) => (
          <label
            key={option}
            className={[
              "rounded-12 text-14 relative cursor-pointer border px-4 py-3 text-center font-semibold",
              type === option
                ? "border-brand bg-brand-tint text-brand"
                : "border-line text-ink",
            ].join(" ")}
          >
            <input
              type="radio"
              name="contact-type"
              className="sr-only"
              checked={type === option}
              disabled={busy || sent}
              onChange={() => {
                setType(option);
                setValue("");
              }}
            />
            {option === "email" ? copy.email : copy.phone}
          </label>
        ))}
      </div>

      <Field
        label={type === "email" ? copy.newEmail : copy.newPhone}
        help={type === "mobile" ? copy.phoneHelp : undefined}
      >
        {(ids) => (
          <Input
            {...ids}
            startIcon={
              type === "mobile" ? (
                <span className="text-16 text-ink-muted">{DEFAULT_DIAL_CODE}</span>
              ) : undefined
            }
            inputMode={type === "mobile" ? "numeric" : undefined}
            type={type === "email" ? "email" : "tel"}
            autoComplete={type === "email" ? "email" : "tel"}
            value={value}
            disabled={busy || sent}
            onChange={(event) => setValue(event.target.value)}
          />
        )}
      </Field>

      {sent ? (
        <>
          <p className="text-14 text-ink-muted">{copy.codeSent}</p>
          <Field label={copy.code}>
            {(ids) => (
              <Input
                {...ids}
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                disabled={busy}
                onChange={(event) => setOtp(event.target.value)}
              />
            )}
          </Field>
        </>
      ) : null}

      <p role="status" className="text-14 text-danger empty:hidden">
        {notice}
      </p>

      {sent ? (
        <Button block disabled={busy || !otp.trim()} onClick={confirm}>
          {copy.confirm}
        </Button>
      ) : (
        <Button block disabled={busy || !value.trim()} onClick={sendCode}>
          {copy.sendCode}
        </Button>
      )}
    </Modal>
  );
}
