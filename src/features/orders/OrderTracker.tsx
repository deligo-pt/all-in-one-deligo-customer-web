import type { OrderStep } from "./types";

export type TrackerCopy = { label: string; step: Record<OrderStep, string> };

/**
 * `Confirmed · Kitchen · Packed · Ready for pickup · Collected`.
 *
 * Measured from the `Section - Progress Tracker` component set: five steps at
 * 10/700, the reached ones in brand and the rest in `ink`.
 *
 * `step` is a position on a known list, not a percentage. A number would put
 * the frontend in charge of deciding what 60% of an order looks like.
 */
export function OrderTracker({
  steps,
  step,
  copy,
}: {
  /** The vertical's journey, from `ORDER_STEPS`. */
  steps: readonly OrderStep[];
  step: OrderStep;
  copy: TrackerCopy;
}) {
  const reached = steps.indexOf(step);

  return (
    <ol className="flex flex-wrap items-center gap-2" aria-label={copy.label}>
      {steps.map((name, index) => {
        const done = index <= reached;
        return (
          <li key={name} className="flex flex-1 items-center gap-2">
            <span className="flex min-w-0 flex-1 flex-col gap-2">
              <span
                aria-hidden
                className={[
                  "h-1 w-full rounded-full",
                  done ? "bg-brand" : "bg-line",
                ].join(" ")}
              />
              <span
                aria-current={index === reached ? "step" : undefined}
                className={[
                  "text-10 font-bold tracking-wide uppercase",
                  done ? "text-brand" : "text-ink",
                ].join(" ")}
              >
                {copy.step[name]}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
