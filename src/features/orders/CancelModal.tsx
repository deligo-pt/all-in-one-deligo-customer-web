"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export type CancelCopy = {
  title: string;
  body: string;
  close: string;
  question: string;
  /** The offered reasons, in the customer's language. The chosen sentence is
   *  what the API stores and shows on the order's timeline. */
  reasons: readonly string[];
  other: string;
  otherPlaceholder: string;
  confirm: string;
  keep: string;
};

const OTHER = -1;

/**
 * Calling off an order. The API requires a non-empty `reason`, so the customer
 * gives one: the old app's four choices (matching the mobile app), with "Other"
 * opening a text box. A refusal keeps the dialog open with the choice intact,
 * and shows the API's own sentence.
 */
export function CancelModal({
  open,
  onOpenChange,
  busy,
  notice,
  onConfirm,
  copy,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  busy?: boolean;
  notice?: string | null;
  onConfirm: (reason: string) => void;
  copy: CancelCopy;
}) {
  const [choice, setChoice] = useState<number | null>(null);
  const [other, setOther] = useState("");
  const reason =
    choice === null
      ? ""
      : choice === OTHER
        ? other.trim()
        : (copy.reasons[choice] ?? "");

  return (
    <Modal
      open={open}
      onOpenChange={(next) => !busy && onOpenChange(next)}
      title={copy.title}
      description={copy.body}
      closeLabel={copy.close}
      className="w-[min(32rem,calc(100vw-2rem))]"
    >
      <div role="radiogroup" aria-label={copy.question} className="flex flex-col gap-3">
        <p className="text-14 text-ink-strong font-semibold">{copy.question}</p>
        {[
          ...copy.reasons.map((label, index) => [index, label] as const),
          [OTHER, copy.other] as const,
        ].map(([index, label]) => (
          <label
            key={index}
            className={[
              "rounded-12 flex cursor-pointer items-center gap-3 border p-3",
              choice === index ? "border-brand bg-brand-tint" : "border-line",
            ].join(" ")}
          >
            <input
              type="radio"
              name="cancel-reason"
              className="accent-brand size-4 shrink-0"
              checked={choice === index}
              onChange={() => setChoice(index)}
            />
            <span className="text-16 text-ink">{label}</span>
          </label>
        ))}
        {choice === OTHER ? (
          <textarea
            rows={3}
            maxLength={300}
            value={other}
            onChange={(event) => setOther(event.target.value)}
            aria-label={copy.other}
            placeholder={copy.otherPlaceholder}
            className="border-line rounded-12 bg-surface-muted text-14 text-ink w-full resize-none border p-3"
          />
        ) : null}
      </div>

      <p role="status" className="text-14 text-danger empty:hidden">
        {notice}
      </p>

      <div className="flex flex-wrap justify-end gap-3">
        <Button variant="outline" disabled={busy} onClick={() => onOpenChange(false)}>
          {copy.keep}
        </Button>
        <Button disabled={busy || !reason} onClick={() => onConfirm(reason)}>
          {copy.confirm}
        </Button>
      </div>
    </Modal>
  );
}
