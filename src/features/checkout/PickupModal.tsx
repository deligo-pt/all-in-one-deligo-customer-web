"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import type { Locale } from "@/lib/i18n/locale";
import { BCP47 } from "@/lib/i18n/locale";
import {
  formatTimeOfDay,
  pickupDays,
  slotRange,
  slotToIso,
  type PickupHours,
  type TimeOfDay,
} from "@/lib/pickup";

export type PickupCopy = {
  title: string;
  body: string;
  close: string;
  today: string;
  tomorrow: string;
  noSlots: string;
  confirm: string;
};

/**
 * Choosing when to collect — the old app's pickup sheet in the design's modal.
 *
 * The days and their 30-minute slots are computed when the dialog opens, from
 * the store's hours and the store-local clock (`lib/pickup.ts`): today only for
 * a restaurant, up to two days ahead for a store, the first slot at least ten
 * minutes away. The API is the final word — a refusal (a slot that passed, a
 * closed day) is shown here in its own sentence and the dialog stays open.
 */
export function PickupModal({
  open,
  onOpenChange,
  hours,
  locale,
  busy,
  notice,
  onConfirm,
  copy,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hours: PickupHours;
  locale: Locale;
  busy?: boolean;
  notice?: string | null;
  onConfirm: (pickupTime: string) => void;
  copy: PickupCopy;
}) {
  const [days] = useState(() => pickupDays(hours));
  const firstOpen = Math.max(
    0,
    days.findIndex((day) => day.slots.length > 0),
  );
  const [dayIndex, setDayIndex] = useState(firstOpen);
  const [slot, setSlot] = useState<TimeOfDay | null>(null);
  const day = days[dayIndex];

  const dayName = (offset: number) => {
    if (offset === 0) return copy.today;
    if (offset === 1) return copy.tomorrow;
    const date = days[offset]!.date;
    return new Intl.DateTimeFormat(BCP47[locale], {
      timeZone: "UTC",
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(new Date(Date.UTC(date.year, date.month - 1, date.day, 12)));
  };

  return (
    <Modal
      open={open}
      onOpenChange={(next) => !busy && onOpenChange(next)}
      title={copy.title}
      description={copy.body}
      closeLabel={copy.close}
      className="w-[min(40rem,calc(100vw-2rem))]"
    >
      {days.length > 1 ? (
        <div role="radiogroup" aria-label={copy.title} className="flex flex-wrap gap-2">
          {days.map((candidate, index) => (
            <label
              key={candidate.offset}
              className={[
                "rounded-full text-14 relative cursor-pointer border px-4 py-2 font-semibold",
                index === dayIndex
                  ? "border-brand bg-brand-tint text-brand"
                  : "border-line text-ink",
              ].join(" ")}
            >
              <input
                type="radio"
                name="pickup-day"
                className="sr-only"
                checked={index === dayIndex}
                onChange={() => {
                  setDayIndex(index);
                  setSlot(null);
                }}
              />
              {dayName(candidate.offset)}
            </label>
          ))}
        </div>
      ) : null}

      {!day || day.slots.length === 0 ? (
        <EmptyState
          icon={<Icon name="clock" className="size-8" />}
          title={copy.noSlots}
        />
      ) : (
        <div
          role="radiogroup"
          aria-label={dayName(day.offset)}
          className="grid max-h-80 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3"
        >
          {day.slots.map((time) => {
            const selected =
              slot?.hours === time.hours && slot?.minutes === time.minutes;
            return (
              <label
                key={formatTimeOfDay(time)}
                className={[
                  "rounded-12 text-14 relative cursor-pointer border px-3 py-3 text-center font-medium",
                  selected
                    ? "border-brand bg-brand-tint text-brand"
                    : "border-line text-ink",
                ].join(" ")}
              >
                <input
                  type="radio"
                  name="pickup-slot"
                  className="sr-only"
                  checked={selected}
                  onChange={() => setSlot(time)}
                />
                {slotRange(time, hours.closingHours)}
              </label>
            );
          })}
        </div>
      )}

      <p role="status" className="text-14 text-danger empty:hidden">
        {notice}
      </p>

      <Button
        block
        shape="pill"
        className="h-14"
        disabled={busy || !slot || !day}
        onClick={() =>
          slot && day && onConfirm(slotToIso({ date: day.date, time: slot }))
        }
      >
        {copy.confirm}
      </Button>
    </Modal>
  );
}
