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
  terms: string;
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
 * wash with white `Applied` text, the available one on white with a `line-
 * subtle` border, and the unavailable one flat grey with its reason in red.
 *
 * **No voucher ships.** `DELIGO20`, `FREEDELIVERY` and `WELCOME5` are the
 * design's sample content, and which of them a given customer can use is a
 * question about their order history and each voucher's own rules — three
 * things a frontend would be guessing at. The list renders whatever the API
 * returns and says so when it returns nothing; the populated design is at
 * `/checkout-states`.
 */
export function VoucherModal({
  open,
  onOpenChange,
  vouchers,
  unavailable,
  onApply,
  copy,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vouchers: readonly Voucher[];
  /** The list could not be read at all — a different sentence from "you have
   *  no vouchers", with a different fix, and only one of them is the
   *  customer's. */
  unavailable?: boolean;
  onApply: (code: string) => void;
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
            onChange={(event) => setCode(event.target.value)}
            className="h-10 border-none bg-transparent px-0"
          />
          <Button
            size="sm"
            variant="secondary"
            className="rounded-8"
            disabled={code.trim().length === 0}
            onClick={() => onApply(code.trim())}
          >
            {copy.apply}
          </Button>
        </div>

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
              <li key={voucher.code}>
                <VoucherCard voucher={voucher} onApply={onApply} copy={copy} />
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
  onApply,
  copy,
}: {
  voucher: Voucher;
  onApply: (code: string) => void;
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
            {voucher.code}
          </p>
          <p className="text-16 text-ink-warm">{voucher.description}</p>
          {/* Verbatim. "You save €8.00" and "Min. order €20 · Use by Oct 5"
              are the voucher's own terms, and nothing here recomputes one. */}
          {voucher.terms ? (
            <p
              className={[
                "text-12 font-medium",
                unavailable ? "text-danger" : "text-brand-strong",
              ].join(" ")}
            >
              {voucher.terms}
            </p>
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
            disabled={unavailable}
            onClick={() => onApply(voucher.code)}
          >
            {copy.apply}
          </Button>
        )}
      </div>
      <p className="text-12 text-ink-muted font-medium">{copy.terms}</p>
    </article>
  );
}
