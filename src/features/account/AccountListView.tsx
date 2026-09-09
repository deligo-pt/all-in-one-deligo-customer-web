"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon, type IconName } from "@/components/ui/Icon";
import { AccountShell, type AccountNavItem } from "./AccountShell";

export type AccountListCopy = {
  title: string;
  subtitle?: string;
  navLabel: string;
  add?: string;
  remove: string;
  default: string;
  emptyTitle: string;
  emptyBody: string;
  unavailableTitle: string;
  unavailableBody: string;
  notWired: string;
};

export type AccountListRow = {
  id: string;
  title: string;
  body?: string;
  meta?: string;
  isDefault?: boolean;
  removable?: boolean;
};

/**
 * Addresses, saved cards and vouchers, drawn once.
 *
 * All three are the same shape in the design's mobile frames — a label, a
 * detail line, an optional default marker and a destructive action — and the
 * desktop file draws none of them (D-16). Three near-identical components
 * would be three places for the empty state, the refusal and the delete
 * confirmation to drift apart; the previous project's seven pinks started
 * exactly this way.
 *
 * The remove action goes through the transport and is refused out loud.
 * Removing a card or an address is not undoable, so a local splice that
 * *looked* like it worked would be the worst possible version.
 */
export function AccountListView({
  rows,
  nav,
  activeId,
  icon,
  copy,
  onRemove,
  unavailable = false,
  children,
}: {
  rows: readonly AccountListRow[];
  nav: readonly AccountNavItem[];
  activeId: string;
  icon: IconName;
  copy: AccountListCopy;
  /** Rejects in Track B; Phase 20 supplies the real one. */
  onRemove?: (id: string) => Promise<void>;
  unavailable?: boolean;
  /** Anything the page needs above the list — the referral code panel uses it. */
  children?: ReactNode;
}) {
  const router = useRouter();
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function remove(id: string) {
    if (!onRemove) return;
    setBusy(true);
    setNotice(null);
    try {
      await onRemove(id);
      router.refresh();
    } catch {
      setNotice(copy.notWired);
    } finally {
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

        {copy.add ? (
          <Button variant="outline" className="self-start" disabled={busy}>
            <Icon name="plus" className="size-4" />
            {copy.add}
          </Button>
        ) : null}

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
                    {row.isDefault ? (
                      <Badge tone="brand">{copy.default}</Badge>
                    ) : null}
                  </p>
                  {row.body ? (
                    <p className="text-14 text-ink-muted">{row.body}</p>
                  ) : null}
                  {row.meta ? (
                    <p className="text-12 text-ink-warm font-medium">{row.meta}</p>
                  ) : null}
                </div>
                {row.removable && onRemove ? (
                  <Button
                    variant="link"
                    className="text-14 text-danger font-semibold"
                    disabled={busy}
                    onClick={() => remove(row.id)}
                  >
                    {copy.remove}
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        )}

        <p role="status" className="text-14 text-ink-muted">
          {notice}
        </p>
      </div>
    </AccountShell>
  );
}
