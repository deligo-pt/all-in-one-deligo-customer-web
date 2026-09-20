"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import type { Voucher } from "./types";

export type VoucherCopy = {
  title: string;
  close: string;
  codeLabel: string;
  codePlaceholder: string;
  apply: string;
  applied: string;
  remove: string;
  emptyTitle: string;
  emptyBody: string;
  unavailableTitle: string;
  unavailableBody: string;
};

/**
 * `Apply a voucher` — 520×673 at 24px radius on `surface-subtle`.
 *
 * Measured: a sticky 73px header with the title at 20/600; a 56px code field
 * at 16px radius with an `APPLY` button inside it; then the list at 16 apart,
 * each card 20px radius with 16 inside. The applied card is drawn on a pink
 * wash, the available one on white with a `line-subtle` border, and the
 * unavailable one flat grey with its reason in red.
 *
 * Every voucher, its terms and whether it applies are the API's
 * (`/offers/available-offers/:id`); the reason an offer does not apply is the
 * backend's own sentence. **Removing** a voucher has no endpoint: the checkout
 * is rebuilt from the cart without it, which is what the old app did.
 */
export function VoucherModal({
  open,
  onOpenChange,
  vouchers,
  appliedCode,
  unavailable,
  busy,
  notice,
  onApply,
  onRemove,
  copy,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vouchers: readonly Voucher[];
  appliedCode?: string;
  /** The list could not be read — a different sentence from "none apply". */
  unavailable?: boolean;
  busy?: boolean;
  notice?: string | null;
  onApply: (identifier: string) => void;
  onRemove: () => void;
  copy: VoucherCopy;
}) {
  const [code, setCode] = useState("");

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={copy.title}
      closeLabel={copy.close}
      className="bg-surface-subtle w-[min(32.5rem,calc(100vw-2rem))] p-0"
    >
      <div className="flex flex-col gap-6 p-6">
        <div className="bg-surface-muted rounded-16 flex items-center gap-2 p-2 ps-4">
          <Input
            aria-label={copy.codeLabel}
            placeholder={copy.codePlaceholder}
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            className="h-10 border-none bg-transparent px-0"
          />
          <Button
            size="sm"
            variant="secondary"
            className="rounded-8"
            disabled={busy || code.trim().length === 0}
            onClick={() => onApply(code.trim())}
          >
            {copy.apply}
          </Button>
        </div>

        {appliedCode ? (
          <div className="bg-brand-pale rounded-16 flex items-center justify-between gap-4 px-4 py-3">
            <span className="text-16 text-brand-deep font-semibold">{appliedCode}</span>
            <Button
              variant="link"
              className="text-14 font-semibold"
              disabled={busy}
              onClick={onRemove}
            >
              {copy.remove}
            </Button>
          </div>
        ) : null}

        <p role="status" className="text-14 text-danger empty:hidden">
          {notice}
        </p>

        {unavailable ? (
          <EmptyState
            icon={<Icon name="tag" className="size-8" />}
            title={copy.unavailableTitle}
            description={copy.unavailableBody}
          />
        ) : vouchers.length === 0 ? (
          <EmptyState
            icon={<Icon name="tag" className="size-8" />}
            title={copy.emptyTitle}
            description={copy.emptyBody}
          />
        ) : (
          <ul className="flex flex-col gap-4">
            {vouchers.map((voucher) => (
              <li key={voucher.id}>
                <VoucherCard
                  voucher={voucher}
                  busy={busy}
                  onApply={onApply}
                  copy={copy}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}

function VoucherCard({
  voucher,
  busy,
  onApply,
  copy,
}: {
  voucher: Voucher;
  busy?: boolean;
  onApply: (identifier: string) => void;
  copy: VoucherCopy;
}) {
  const applied = voucher.state === "applied";
  const unavailable = voucher.state === "unavailable";

  return (
    <article
      className={[
        "rounded-20 flex flex-col gap-2 p-4",
        applied ? "bg-brand-pale" : "",
        unavailable ? "bg-surface-muted" : "",
        !applied && !unavailable ? "border-line-subtle bg-surface border" : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-2">
          <p
            className={[
              "text-20 font-semibold",
              applied
                ? "text-brand-deep"
                : unavailable
                  ? "text-ink-warm"
                  : "text-ink-strong",
            ].join(" ")}
          >
            {voucher.code ?? voucher.title}
          </p>
          {voucher.code && voucher.title ? (
            <p className="text-16 text-ink-strong font-medium">{voucher.title}</p>
          ) : null}
          {voucher.description ? (
            <p className="text-16 text-ink-warm">{voucher.description}</p>
          ) : null}
          {voucher.terms ? (
            <p className="text-12 text-brand-strong font-medium">{voucher.terms}</p>
          ) : null}
          {voucher.message ? (
            <p className="text-12 text-danger font-medium">{voucher.message}</p>
          ) : null}
        </div>

        {applied ? (
          <span className="bg-brand-strong text-ink-inverse text-14 shrink-0 rounded-full px-3 py-1 font-semibold">
            {copy.applied}
          </span>
        ) : (
          <Button
            variant="link"
            className="text-14 shrink-0 font-semibold"
            disabled={busy || unavailable}
            onClick={() => onApply(voucher.identifier)}
          >
            {copy.apply}
          </Button>
        )}
      </div>
    </article>
  );
}
