"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon, type IconName } from "@/components/ui/Icon";
import { CopyButton } from "@/components/shared/CopyButton";
import { accountApi } from "./api";
import { AccountShell, type AccountNavItem } from "@/components/layout/AccountShell";

export type AccountListCopy = {
  title: string;
  subtitle?: string;
  navLabel: string;
  remove: string;
  confirmRemove: string;
  cancel: string;
  default: string;
  emptyTitle: string;
  emptyBody: string;
  unavailableTitle: string;
  unavailableBody: string;
  actionFailed: string;
  copy: string;
  copied: string;
};

export type AccountListRow = {
  id: string;
  title: string;
  body?: string;
  meta?: string;
  isDefault?: boolean;
  removable?: boolean;
  /** A code the row offers to copy (a voucher). */
  copyText?: string;
};

/**
 * Saved cards and vouchers, drawn once (the design draws neither; D-16).
 *
 * Removing asks twice — the second press is the one that sends — because a
 * removed card cannot be restored from here. Every removal re-reads the page
 * from the server; a refusal shows the API's own sentence.
 */
export function AccountListView({
  rows,
  nav,
  activeId,
  icon,
  copy,
  removes,
  unavailable = false,
  offlineNotice,
  children,
}: {
  rows: readonly AccountListRow[];
  nav: readonly AccountNavItem[];
  activeId: string;
  icon: IconName;
  copy: AccountListCopy;
  /** What a row's Remove does. Only saved cards can be removed from a list;
   *  a function cannot cross from the server page, so the kind is named. */
  removes?: "card";
  unavailable?: boolean;
  /** Set on the states page: every write refuses with this sentence. */
  offlineNotice?: string;
  /** Anything the page needs above the list — the referral panel uses it. */
  children?: ReactNode;
}) {
  const router = useRouter();
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);

  async function remove(id: string) {
    if (!removes) return;
    if (offlineNotice) return setNotice(offlineNotice);
    setBusy(true);
    setNotice(null);
    try {
      await accountApi.removeCard(id);
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
      activeId={activeId}
      navLabel={copy.navLabel}
    >
      <div className="flex flex-col gap-6">
        {children}

        <p role="status" className="text-14 text-danger empty:hidden">
          {notice}
        </p>

        {unavailable ? (
          <EmptyState
            icon={<Icon name={icon} className="size-8" />}
            title={copy.unavailableTitle}
            description={copy.unavailableBody}
          />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<Icon name={icon} className="size-8" />}
            title={copy.emptyTitle}
            description={copy.emptyBody}
          />
        ) : (
          <ul className="flex flex-col gap-4">
            {rows.map((row) => (
              <li
                key={row.id}
                className="border-line rounded-16 bg-surface flex flex-wrap items-start justify-between gap-4 border p-5"
              >
                <div className="flex min-w-0 flex-col gap-1">
                  <p className="text-16 text-ink flex items-center gap-3 font-medium">
                    {row.title}
                    {row.isDefault ? <Badge tone="brand">{copy.default}</Badge> : null}
                  </p>
                  {row.body ? (
                    <p className="text-14 text-ink-muted">{row.body}</p>
                  ) : null}
                  {row.meta ? (
                    <p className="text-12 text-ink-warm font-medium">{row.meta}</p>
                  ) : null}
                </div>
                {row.copyText ? (
                  <CopyButton
                    text={row.copyText}
                    label={copy.copy}
                    copiedLabel={copy.copied}
                  />
                ) : null}
                {row.removable && removes ? (
                  confirming === row.id ? (
                    <div className="flex items-center gap-3">
                      <Button
                        variant="danger"
                        size="sm"
                        disabled={busy}
                        onClick={() => remove(row.id)}
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
                    </div>
                  ) : (
                    <Button
                      variant="link"
                      className="text-14 text-danger font-semibold"
                      disabled={busy}
                      onClick={() => setConfirming(row.id)}
                    >
                      {copy.remove}
                    </Button>
                  )
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </AccountShell>
  );
}
