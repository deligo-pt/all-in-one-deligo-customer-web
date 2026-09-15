"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { accountApi } from "./api";
import type { Profile } from "./types";

export type ProfileEditCopy = {
  title: string;
  close: string;
  firstName: string;
  lastName: string;
  nif: string;
  nifHelp: string;
  save: string;
  actionFailed: string;
};

/** The name and tax number — what `PATCH /customers/:userId` accepts besides
 *  the photo. A refusal (the API's field message) keeps the dialog open. */
export function ProfileEditModal({
  open,
  onOpenChange,
  profile,
  onSaved,
  offlineNotice,
  copy,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile;
  onSaved: () => void;
  offlineNotice?: string;
  copy: ProfileEditCopy;
}) {
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [nif, setNif] = useState(profile.nif ?? "");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function save() {
    if (offlineNotice) return setNotice(offlineNotice);
    setBusy(true);
    setNotice(null);
    try {
      await accountApi.updateProfile(profile.accountId, { firstName, lastName, nif });
      onSaved();
    } catch (error) {
      setNotice(
        error instanceof Error && error.message ? error.message : copy.actionFailed,
      );
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={(next) => !busy && onOpenChange(next)}
      title={copy.title}
      closeLabel={copy.close}
      className="w-[min(36rem,calc(100vw-2rem))]"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={copy.firstName} required>
          {(ids) => (
            <Input
              {...ids}
              value={firstName}
              autoComplete="given-name"
              onChange={(event) => setFirstName(event.target.value)}
            />
          )}
        </Field>
        <Field label={copy.lastName}>
          {(ids) => (
            <Input
              {...ids}
              value={lastName}
              autoComplete="family-name"
              onChange={(event) => setLastName(event.target.value)}
            />
          )}
        </Field>
        <div className="sm:col-span-2">
          <Field label={copy.nif} help={copy.nifHelp}>
            {(ids) => (
              <Input
                {...ids}
                value={nif}
                inputMode="numeric"
                onChange={(event) => setNif(event.target.value)}
              />
            )}
          </Field>
        </div>
      </div>

      <p role="status" className="text-14 text-danger empty:hidden">
        {notice}
      </p>

      <Button block disabled={busy || !firstName.trim()} onClick={save}>
        {copy.save}
      </Button>
    </Modal>
  );
}
