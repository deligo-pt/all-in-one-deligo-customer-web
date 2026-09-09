"use client";

import { useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import type { DeliveryDay, DeliverySlot } from "./types";

export type ScheduleModalCopy = {
  title: string;
  body: string;
  close: string;
  yourDelivery: string;
  recommended: string;
  emptyTitle: string;
  emptyBody: string;
  unavailableTitle: string;
  unavailableBody: string;
};

/**
 * `Smart Delivery` — 640×699 at 24px radius.
 *
 * Measured: a 108px header with the title at 20/600 over 14/400 in `ink-warm`;
 * a date strip of 72×88 tiles at 16px radius, the weekday at 12/500 above the
 * date at 20/600, the chosen one filled `brand`; then the recommendation on a
 * `brand-tint` panel at 20px radius; then the windows as a two-column grid of
 * 280×112 tiles at 20px radius, the chosen one filled `brand`.
 *
 * **Every date, window and count is the backend's.** "6 slots available",
 * "Almost full · 2 left" — the sentence *and* whether it is urgent both come
 * from the API, because deriving urgency would mean parsing a sentence to find
 * a number the server already knows. Nothing is scheduled in Track B; the
 * picker renders its unavailable state and the populated version is at
 * `/checkout-states`.
 */
export function ScheduleModal({
  open,
  onOpenChange,
  days,
  unavailable,
  onSelect,
  copy,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  days: readonly DeliveryDay[];
  unavailable?: boolean;
  onSelect: (day: DeliveryDay, slot: DeliverySlot) => void;
  copy: ScheduleModalCopy;
}) {
  const [dayId, setDayId] = useState<string | null>(null);
  const day = days.find((entry) => entry.id === dayId) ?? days[0] ?? null;
  const recommended = day?.slots.find((slot) => slot.recommended);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={copy.title}
      description={copy.body}
      closeLabel={copy.close}
      className="w-[min(40rem,calc(100vw-2rem))]"
    >
      {unavailable || days.length === 0 ? (
        <EmptyState
          icon={<Icon name="clock" className="size-8" />}
          title={unavailable ? copy.unavailableTitle : copy.emptyTitle}
          description={unavailable ? copy.unavailableBody : copy.emptyBody}
        />
      ) : (
        <>
          <div
            className="flex flex-wrap gap-3"
            role="radiogroup"
            aria-label={copy.yourDelivery}
          >
            {days.map((entry) => {
              const selected = entry.id === day?.id;
              return (
                <label
                  key={entry.id}
                  className={[
                    "rounded-16 flex h-22 w-18 cursor-pointer flex-col items-center justify-center gap-1 transition-colors",
                    selected
                      ? "bg-brand text-ink-inverse"
                      : "bg-surface-muted text-ink-warm",
                  ].join(" ")}
                >
                  <input
                    type="radio"
                    name="checkout-schedule-day"
                    className="sr-only"
                    checked={selected}
                    onChange={() => setDayId(entry.id)}
                  />
                  <span className="text-12 font-medium tracking-wide uppercase">
                    {entry.weekday}
                  </span>
                  <span className="text-20 font-semibold">{entry.day}</span>
                </label>
              );
            })}
          </div>

          {recommended ? (
            <div className="bg-brand-tint rounded-20 flex items-center gap-4 p-4">
              <span
                aria-hidden
                className="bg-surface text-brand flex size-12 shrink-0 items-center justify-center rounded-full"
              >
                <Icon name="clock" className="size-6" />
              </span>
              <div className="flex flex-col gap-0.5">
                <p className="text-16 text-ink font-medium">
                  {`${copy.recommended} ${recommended.window}`}
                </p>
                {recommended.availability ? (
                  <p className="text-12 text-ink-warm font-medium">
                    {recommended.availability}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            {day?.slots.map((slot) => (
              <button
                key={slot.id}
                type="button"
                onClick={() => day && onSelect(day, slot)}
                className="bg-surface-muted rounded-20 flex flex-col gap-2 p-5 text-start transition-colors hover:brightness-95"
              >
                <span className="text-16 text-ink font-semibold">{slot.window}</span>
                {slot.availability ? (
                  <span
                    className={[
                      "text-12 font-medium",
                      slot.tone === "urgent" ? "text-danger" : "text-ink-warm",
                    ].join(" ")}
                  >
                    {slot.availability}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </>
      )}
    </Modal>
  );
}
