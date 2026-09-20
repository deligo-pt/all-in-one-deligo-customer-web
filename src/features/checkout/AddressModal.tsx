"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import type { SavedAddress } from "./types";

export type AddressCopy = {
  title: string;
  body: string;
  close: string;
  active: string;
  emptyTitle: string;
  emptyBody: string;
};

/**
 * Choosing where the order goes — the design's 800px location dialog, holding
 * the customer's saved addresses.
 *
 * The design draws a map and a free-text address field. The API cannot take
 * one: `/checkout` binds to the **active** saved address and rejects an
 * address id (measured), so the only choice checkout can offer is which saved
 * address is active — and that change is account-wide, which the body says.
 * Adding an address is the account's (Phase 20).
 */
export function AddressModal({
  open,
  onOpenChange,
  addresses,
  busy,
  notice,
  onChoose,
  copy,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addresses: readonly SavedAddress[];
  busy?: boolean;
  notice?: string | null;
  onChoose: (address: SavedAddress) => void;
  copy: AddressCopy;
}) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={copy.title}
      description={copy.body}
      closeLabel={copy.close}
      className="w-[min(50rem,calc(100vw-2rem))]"
    >
      {addresses.length === 0 ? (
        <EmptyState
          icon={<Icon name="location" className="size-8" />}
          title={copy.emptyTitle}
          description={copy.emptyBody}
        />
      ) : (
        <div role="radiogroup" aria-label={copy.title} className="flex flex-col gap-3">
          {addresses.map((address) => (
            <label
              key={address.id}
              className={[
                "rounded-16 flex cursor-pointer items-start gap-4 border p-4 transition-colors",
                address.active
                  ? "border-brand bg-brand-tint"
                  : "border-line hover:bg-surface-muted",
              ].join(" ")}
            >
              <span
                aria-hidden
                className="bg-brand-tint text-brand rounded-8 flex size-10 shrink-0 items-center justify-center"
              >
                <Icon name="location" className="size-5" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-14 text-ink-warm font-semibold uppercase">
                  {address.label}
                  {address.active ? ` · ${copy.active}` : ""}
                </span>
                <span className="text-16 text-ink break-words">{address.line}</span>
              </span>
              <input
                type="radio"
                name="checkout-address"
                className="accent-brand mt-1 size-5 shrink-0"
                checked={address.active}
                disabled={busy}
                onChange={() => onChoose(address)}
              />
            </label>
          ))}
        </div>
      )}

      <p role="status" className="text-14 text-danger empty:hidden">
        {notice}
      </p>
    </Modal>
  );
}
