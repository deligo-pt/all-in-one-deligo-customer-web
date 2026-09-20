"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { StarInput } from "./StarInput";
import type { Order } from "./types";

export type ReviewCopy = {
  title: string;
  close: string;
  overall: string;
  thanks: string;
  placeholder: string;
  /** Already carries the rider's name. */
  riderQuestion: string;
  starLabels: readonly string[];
  submit: string;
  skip: string;
};

/**
 * `How was your order?` — 720×561 at 20px radius.
 *
 * Measured: the heading at 28/600, a meta line, `OVERALL EXPERIENCE` above the
 * stars, a `surface-warm` textarea, the rider question, then `Submit Review`
 * and `Skip for now`.
 *
 * The overall score is sent as every product's score (D-20) — the API rates
 * products, the design asks one question — and appears only while the
 * products are unrated; the rider question only while the rider is. A rating
 * cannot be edited or deleted, so a refusal keeps the dialog open.
 */
export function ReviewModal({
  open,
  onOpenChange,
  order,
  busy,
  notice,
  onSubmit,
  copy,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order;
  busy?: boolean;
  notice?: string | null;
  onSubmit: (rating: number, review: string, riderRating: number) => void;
  copy: ReviewCopy;
}) {
  const [rating, setRating] = useState(0);
  const [riderRating, setRiderRating] = useState(0);
  const [review, setReview] = useState("");
  const rateProducts = order.productsToRate.length > 0;
  const ready = (rateProducts && rating > 0) || (order.rateRider && riderRating > 0);

  return (
    <Modal
      open={open}
      onOpenChange={(next) => !busy && onOpenChange(next)}
      title={copy.title}
      description={`${order.vendorName} · ${order.reference} · ${order.statusLabel}`}
      closeLabel={copy.close}
      className="w-[min(45rem,calc(100vw-2rem))]"
    >
      {rateProducts ? (
        <>
          <div className="flex flex-col gap-4">
            <p className="text-14 text-ink-muted font-semibold tracking-wide uppercase">
              {copy.overall}
            </p>
            <StarInput
              value={rating}
              onChange={setRating}
              label={copy.overall}
              starLabels={copy.starLabels}
            />
            {rating > 0 ? <p className="text-14 text-ink">{copy.thanks}</p> : null}
          </div>

          <textarea
            rows={3}
            maxLength={500}
            value={review}
            onChange={(event) => setReview(event.target.value)}
            aria-label={copy.title}
            placeholder={copy.placeholder}
            className="border-line rounded-12 bg-surface-warm text-16 text-ink placeholder:text-ink-warm w-full resize-none border p-4"
          />
        </>
      ) : null}

      {order.rateRider ? (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-16 text-ink-strong">{copy.riderQuestion}</p>
          <StarInput
            value={riderRating}
            onChange={setRiderRating}
            label={copy.riderQuestion}
            starLabels={copy.starLabels}
          />
        </div>
      ) : null}

      <p role="status" className="text-14 text-danger empty:hidden">
        {notice}
      </p>

      <div className="flex flex-col gap-4">
        <Button
          block
          className="rounded-12 bg-brand-strong h-12"
          disabled={busy || !ready}
          onClick={() => onSubmit(rating, review.trim(), riderRating)}
        >
          {copy.submit}
        </Button>
        <Button
          variant="link"
          className="text-16"
          disabled={busy}
          onClick={() => onOpenChange(false)}
        >
          {copy.skip}
        </Button>
      </div>
    </Modal>
  );
}
