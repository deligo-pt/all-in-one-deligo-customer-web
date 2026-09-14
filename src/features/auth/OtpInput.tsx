"use client";

import { useId, useRef } from "react";
import { cn } from "@/lib/cn";

/**
 * How many digits a code has: **four**, which is what the backend sends (the
 * first real sign-in, 14 Sep, and every Postman example — "7185", "6996").
 * The design draws six boxes; six would leave two that can never be filled
 * and a Verify button that never enables. The boxes, the input limit, the
 * button and the copy all read this one number.
 */
export const OTP_LENGTH = 4;

/**
 * The segmented verification code, measured: 48×56 each, 8px radius, 16px apart;
 * an empty box is filled `line-subtle` with no border, the focused one is
 * transparent with a 2px brand border.
 *
 * ## Separate boxes, built so they do not cost what separate boxes usually cost
 *
 * The first version of this screen used one input, on the grounds that a
 * segmented control normally breaks the three things that matter most on an
 * OTP field. The design draws boxes, so it is boxes — and each of those three is
 * handled rather than accepted:
 *
 *  - **Autofill.** `autocomplete="one-time-code"` sits on the first box, which
 *    is what iOS and Android offer the code into. When the platform fills it
 *    with the whole code rather than one character, `spread` catches it — the
 *    same path a paste takes.
 *  - **Paste.** Pasting into any box distributes from that box onward, and
 *    non-digits are stripped first, so a copied "Your code is 123456" works.
 *  - **Screen readers.** Six unlabelled boxes announce as six unlabelled
 *    boxes. Each carries its position, the group is a labelled `group`, and
 *    the caller's `<Field>` label points at the first.
 *
 * Backspace on an empty box steps back and clears the one before it, which is
 * what makes a mistyped code correctable without reaching for the mouse.
 */
export function OtpInput({
  value,
  onChange,
  disabled,
  label,
  id,
  describedBy,
  invalid,
}: {
  /** Digits only, up to `OTP_LENGTH`. Shorter means "not finished". */
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  /** Names the group. The boxes name themselves by position. */
  label: string;
  /** Given to the first box, so a `<label htmlFor>` reaches something real. */
  id?: string;
  describedBy?: string;
  invalid?: boolean;
}) {
  const generated = useId();
  const groupId = id ?? generated;
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const focus = (index: number) => {
    const clamped = Math.min(Math.max(index, 0), OTP_LENGTH - 1);
    refs.current[clamped]?.focus();
    refs.current[clamped]?.select();
  };

  /** Writes `digits` starting at `from`, leaving everything before it alone. */
  const spread = (from: number, digits: string) => {
    const clean = digits.replace(/\D/g, "");
    if (!clean) return;
    const chars = value.padEnd(OTP_LENGTH, " ").split("");
    for (let i = 0; i < clean.length && from + i < OTP_LENGTH; i += 1) {
      chars[from + i] = clean[i] as string;
    }
    onChange(chars.join("").replace(/ /g, "").slice(0, OTP_LENGTH));
    focus(from + clean.length);
  };

  return (
    <div
      role="group"
      aria-label={label}
      aria-describedby={describedBy}
      className="flex items-center gap-4"
    >
      {Array.from({ length: OTP_LENGTH }, (_, index) => {
        const char = value[index] ?? "";
        return (
          <input
            key={index}
            ref={(node) => {
              refs.current[index] = node;
            }}
            id={index === 0 ? groupId : `${groupId}-${index}`}
            type="text"
            inputMode="numeric"
            // Only the first: the platform offers the code to one field, and
            // six fields claiming it is how an autofill lands in the wrong box.
            autoComplete={index === 0 ? "one-time-code" : "off"}
            // `maxLength` is not enough on its own — a platform autofill can
            // still deliver six characters here, which `spread` then
            // distributes. It stops a *typed* seventh.
            maxLength={OTP_LENGTH}
            disabled={disabled}
            aria-label={`${label} ${index + 1}`}
            aria-invalid={invalid || undefined}
            value={char}
            onChange={(event) => spread(index, event.target.value)}
            onPaste={(event) => {
              event.preventDefault();
              spread(index, event.clipboardData.getData("text"));
            }}
            onKeyDown={(event) => {
              if (event.key === "Backspace" && !char) {
                event.preventDefault();
                onChange(value.slice(0, Math.max(index - 1, 0)));
                focus(index - 1);
              }
              // Logical, not physical: `ArrowLeft` moves toward the start of
              // the code, which in a right-to-left document is to the right.
              if (event.key === "ArrowLeft") focus(index - 1);
              if (event.key === "ArrowRight") focus(index + 1);
            }}
            onFocus={(event) => event.currentTarget.select()}
            className={cn(
              "text-20 text-ink h-14 w-12 rounded-8 text-center font-semibold",
              "border-2 transition-colors",
              // An empty box is a filled block with no border; typing into it
              // turns it into an outlined one. That is the design's own
              // distinction and it doubles as a progress indicator.
              char ? "border-brand bg-surface" : "bg-line-subtle border-transparent",
              invalid && "border-danger",
              "disabled:text-ink-subtle disabled:cursor-not-allowed",
            )}
          />
        );
      })}
    </div>
  );
}
