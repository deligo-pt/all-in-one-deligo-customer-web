"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import type { Locale } from "@/lib/i18n/locale";
import { accountApi } from "./api";
import { AccountShell, type AccountNavItem } from "@/components/layout/AccountShell";
import type { AddressFormCopy } from "./AddressFormModal";
import type { AccountAddress } from "./types";

const AddressFormModal = dynamic(
  () => import("./AddressFormModal").then((m) => m.AddressFormModal),
  { ssr: false },
);

export type AddressesCopy = {
  title: string;
  subtitle: string;
  navLabel: string;
  add: string;
  edit: string;
  remove: string;
  confirmRemove: string;
  cancel: string;
  active: string;
  setActive: string;
  activeNote: string;
  emptyTitle: string;
  emptyBody: string;
  unavailableTitle: string;
  unavailableBody: string;
  actionFailed: string;
  form: AddressFormCopy;
};

/**
 * `/account/addresses` — adapted from the 412px `Address` frame (D-16).
 *
 * The active address is the one checkout delivers to and the restaurant
 * listing searches from. Measured: adding an address makes it the active one,
 * which the add button's note says. Removing asks twice. Every write re-reads
 * the page; a refusal shows the API's own sentence.
 */
export function AddressesView({
  addresses,
  nav,
  locale,
  copy,
  unavailable = false,
  offlineNotice,
}: {
  addresses: readonly AccountAddress[];
  nav: readonly AccountNavItem[];
  locale: Locale;
  copy: AddressesCopy;
  unavailable?: boolean;
  offlineNotice?: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<AccountAddress | "new" | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(call: () => Promise<void>) {
    if (offlineNotice) return setNotice(offlineNotice);
    setBusy(true);
    setNotice(null);
    try {
      await call();
      setConfirming(null);
    } catch (error) {
      setNotice(
        error instanceof Error && error.message ? error.message : copy.actionFailed,
      );
    } finally {
      router.refresh();
      setBusy(false);
    }
  }

  return (
    <AccountShell
      title={copy.title}
      subtitle={copy.subtitle}
      nav={nav}
      activeId="addresses"
      navLabel={copy.navLabel}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="outline" disabled={busy} onClick={() => setEditing("new")}>
            <Icon name="plus" className="size-4" />
            {copy.add}
          </Button>
          <p className="text-14 text-ink-muted">{copy.activeNote}</p>
        </div>

        <p role="status" className="text-14 text-danger empty:hidden">
          {editing ? null : notice}
        </p>

        {unavailable ? (
          <EmptyState
            icon={<Icon name="location" className="size-8" />}
            title={copy.unavailableTitle}
            description={copy.unavailableBody}
          />
        ) : addresses.length === 0 ? (
          <EmptyState
            icon={<Icon name="location" className="size-8" />}
            title={copy.emptyTitle}
            description={copy.emptyBody}
          />
        ) : (
          <ul className="flex flex-col gap-4">
            {addresses.map((address) => (
              <li
                key={address.id}
                className={[
                  "rounded-16 bg-surface flex flex-wrap items-start justify-between gap-4 border p-5",
                  address.active ? "border-brand" : "border-line",
                ].join(" ")}
              >
                <div className="flex min-w-0 flex-col gap-1">
                  <p className="text-16 text-ink flex items-center gap-3 font-medium">
                    {address.label}
                    {address.active ? <Badge tone="brand">{copy.active}</Badge> : null}
                  </p>
                  <p className="text-14 text-ink-muted break-words">{address.line}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {confirming === address.id ? (
                    <>
                      <Button
                        variant="danger"
                        size="sm"
                        disabled={busy}
                        onClick={() => run(() => accountApi.removeAddress(address.id))}
                      >
                        {copy.confirmRemove}
                      </Button>
                      <Button
                        variant="link"
                        size="sm"
                        disabled={busy}
                        onClick={() => setConfirming(null)}
                      >
                        {copy.cancel}
                      </Button>
                    </>
                  ) : (
                    <>
                      {!address.active ? (
                        <Button
                          variant="link"
                          size="sm"
                          disabled={busy}
                          onClick={() =>
                            run(() => accountApi.activateAddress(address.id))
                          }
                        >
                          {copy.setActive}
                        </Button>
                      ) : null}
                      <Button
                        variant="link"
                        size="sm"
                        disabled={busy}
                        onClick={() => setEditing(address)}
                      >
                        {copy.edit}
                      </Button>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-danger"
                        disabled={busy}
                        onClick={() => setConfirming(address.id)}
                      >
                        {copy.remove}
                      </Button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {editing ? (
        <AddressFormModal
          open
          onOpenChange={(next) => !next && setEditing(null)}
          address={editing === "new" ? undefined : editing}
          locale={locale}
          offlineNotice={offlineNotice}
          onSaved={() => {
            setEditing(null);
            router.refresh();
          }}
          copy={copy.form}
        />
      ) : null}
    </AccountShell>
  );
}
