import { TIP_OPTIONS } from "./paymentMethods";

export type TipCopy = {
  title: string;
  later: string;
  /** Accessible name for the row, and for each amount: "Tip {amount}". */
  tipLabel: string;
};

/**
 * Six pills — five amounts and `Later`.
 *
 * Measured: 116×42 at 24px radius, 14/600, 24 apart; unselected outlined in
 * `line-warm`, selected filled `brand-tint` with a `brand-soft` border and
 * brand text. (The file draws that border `#EFA0BF`, which is not a colour
 * this system has; it snaps to `brand-soft`, the nearest role — §4's rule for
 * the values that were measured and deliberately not enshrined.)
 *
 * `Later` is not zero and is not "no tip". It is the customer deferring the
 * decision to the delivery, which the old app supports and which a `0€` pill
 * would quietly answer for them.
 *
 * **Nothing here adds up.** A tip changes the total and the total is the
 * backend's to restate — `verify:checkout` fails on arithmetic anywhere in
 * this feature, and the amounts are strings for the same reason every other
 * money value in this project is.
 */
export function TipCard({
  value,
  onChange,
  copy,
}: {
  /** The chosen amount, `"later"`, or nothing chosen yet. */
  value: string | null;
  onChange: (next: string | null) => void;
  copy: TipCopy;
}) {
  const pill = (selected: boolean) =>
    [
      "text-14 rounded-24 h-11 min-w-29 px-6 font-semibold transition-colors",
      selected
        ? "border-brand-soft bg-brand-tint text-brand border"
        : "border-line-warm text-ink hover:bg-surface-muted border",
    ].join(" ");

  return (
    <section className="border-line rounded-24 bg-surface flex flex-col gap-4 border px-6 py-8">
      <h2 className="text-16 text-ink-strong font-semibold">{copy.title}</h2>
      <div className="flex flex-wrap gap-6" role="group" aria-label={copy.title}>
        {TIP_OPTIONS.map((amount) => (
          <button
            key={amount}
            type="button"
            aria-pressed={value === amount}
            aria-label={`${copy.tipLabel} ${amount}`}
            onClick={() => onChange(value === amount ? null : amount)}
            className={pill(value === amount)}
          >
            {amount}
          </button>
        ))}
        <button
          type="button"
          aria-pressed={value === "later"}
          onClick={() => onChange(value === "later" ? null : "later")}
          className={pill(value === "later")}
        >
          {copy.later}
        </button>
      </div>
    </section>
  );
}
