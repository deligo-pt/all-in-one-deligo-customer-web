import { Button } from "@/components/ui/Button";
import type { ScheduledDelivery } from "./types";

export type ScheduleCopy = {
  label: string;
  change: string;
  choose: string;
  chooseBody: string;
};

/**
 * The booked window, above everything else.
 *
 * Measured from the Groceries variant at 2,060px: 815 wide at 20px radius over
 * a `line` border, 24 inside; `SCHEDULED DELIVERY` at 12/500 in `ink-warm`
 * with wide tracking, the day at 20/600 in `ink-strong`, the window at 14/500
 * in `brand-strong`, and a `Change` pill on the right.
 *
 * **It is only drawn on two of the five checkout frames**, and those two are
 * the Groceries ones. That is not a Groceries feature — a scheduled food
 * delivery is the same booking — so the card renders whenever a slot has been
 * chosen and offers to choose one when none has. Hiding it entirely on the
 * food screens would mean a customer who scheduled a restaurant order could
 * not see, or change, when it was coming.
 */
export function ScheduleCard({
  schedule,
  onChange,
  copy,
}: {
  schedule?: ScheduledDelivery;
  onChange: () => void;
  copy: ScheduleCopy;
}) {
  return (
    <section className="border-line rounded-20 bg-surface flex flex-wrap items-center justify-between gap-4 border p-6">
      {schedule ? (
        <div className="flex flex-col gap-1">
          <p className="text-12 text-ink-warm font-medium tracking-wide uppercase">
            {copy.label}
          </p>
          <p className="text-20 text-ink-strong font-semibold">{schedule.day}</p>
          <p className="text-14 text-brand-strong font-medium">{schedule.window}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <p className="text-16 text-ink font-medium">{copy.choose}</p>
          <p className="text-14 text-ink-muted">{copy.chooseBody}</p>
        </div>
      )}
      <Button
        variant="outline"
        shape="pill"
        size="sm"
        className="text-brand-strong border-brand-soft font-semibold"
        onClick={onChange}
      >
        {schedule ? copy.change : copy.choose}
      </Button>
    </section>
  );
}
