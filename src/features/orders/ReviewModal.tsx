"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { StarInput } from "./StarInput";
import type { Order } from "./types";

export type ReviewCopy = {
  title: string;
  close: string;
  status: string;
  overall: string;
  thanks: string;
  placeholder: string;
  /** Already carries the rider's name. */
  riderQuestion: string;
  starLabels: readonly string[];
  submit: string;
  skip: string;
  notWired: string;
};

/**
 * `How was your order?` — 720×561 at 20px radius.
 *
 * Measured: the heading at 28/600, a meta line of vendor · reference · status
 * at 13/400, `OVERALL EXPERIENCE` at 14/600 above the stars, a `surface-warm`
 * textarea at 12px radius, the rider question, then `Submit Review` and
 * `Skip for now`.
 *
 * **One score for the order and one for the rider — no sub-ratings.** That is
 * what the backend now accepts, and it is the shape the other project was
 * rebuilt to this week: `ratingType`, `subRatings` and a rider id are all
 * rejected outright. The frontend never sends who the rider was; the order
 * says.
 *
 * The photo button the design draws is **not built**. Uploading needs a
 * destination, a size limit and a content policy, none of which exist yet, and
 * a button that opens a file picker and drops the file is worse than no button.
 */
export function ReviewModal({
  open,
  onOpenChange,
  order,
  onSubmit,
  copy,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order;
  onSubmit: (rating: number, review: string, riderRating: number) => void;
  copy: ReviewCopy;
}) {
  const [rating, setRating] = useState(0);
  const [riderRating, setRiderRating] = useState(0);
  const [review, setReview] = useState("");

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={copy.title}
      description={`${order.vendorName} · ${order.reference} · ${order.statusLabel}`}
      closeLabel={copy.close}
      className="w-[min(45rem,calc(100vw-2rem))]"
    >
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
        value={review}
        onChange={(event) => setReview(event.target.value)}
        aria-label={copy.title}
        placeholder={copy.placeholder}
        className="border-line rounded-12 bg-surface-warm text-16 text-ink placeholder:text-ink-warm w-full resize-none border p-4"
      />

      {order.rider ? (
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

      <div className="flex flex-col gap-4">
        <Button
          block
          className="rounded-12 bg-brand-strong h-12"
          disabled={rating === 0}
          onClick={() => onSubmit(rating, review.trim(), riderRating)}
        >
          {copy.submit}
        </Button>
        <Button variant="link" className="text-16" onClick={() => onOpenChange(false)}>
          {copy.skip}
        </Button>
      </div>
    </Modal>
  );
}
