"use client";

import { useId } from "react";
import { Checkbox } from "@/components/ui/Checkbox";
import { Radio, RadioGroupRoot } from "@/components/ui/Radio";
import { cn } from "@/lib/cn";
import type { OptionGroup } from "./types";

/**
 * One group of choices on a dish — Choice of Size, Choice of Crust, Extras.
 *
 * Measured from the app's `Section - Choice of Size`: the group name at 16/600
 * beside a `REQUIRED` pill (brand-tint, 12/600 brand, fully rounded); rows at
 * 52 tall, 8px radius, white on a `line` border, 8px apart; the choice name at
 * one end and its price delta at the other.
 *
 * ## `maxSelectable` decides the control, and nothing else does
 *
 * One means radio, more than one means checkbox. That is the only signal —
 * not the group's name, not whether it is called "Choice of", not a flag the
 * frontend keeps. Getting it from the data is what stops a group being a
 * radio here and a checkbox in the app.
 *
 * ## Required is enforced before the request, not after
 *
 * The old app learned this: the backend rejects a line missing a mandatory
 * group, and the rejection names a group the customer cannot see from the
 * error. So the pill is visible, the modal blocks, and the message points at
 * the group. This component only reports; `ProductModal` decides.
 *
 * A price delta is the backend's phrasing — "Include", "+4.50€" — and is
 * rendered exactly as sent.
 */
export function OptionGroupField({
  group,
  value,
  onChange,
  requiredLabel,
  invalid,
}: {
  group: OptionGroup;
  /** The chosen ids. A radio group holds at most one. */
  value: readonly string[];
  onChange: (next: readonly string[]) => void;
  requiredLabel: string;
  /** The customer tried to add without satisfying this group. */
  invalid?: boolean;
}) {
  const id = useId();
  const single = group.maxSelectable <= 1;
  const required = group.minSelectable > 0;

  const rows = group.choices.map((choice) => {
    const rowId = `${id}-${choice.id}`;
    const checked = value.includes(choice.id);
    return (
      <li key={choice.id}>
        <label
          htmlFor={rowId}
          className={cn(
            "border-line rounded-8 bg-surface flex h-13 cursor-pointer items-center gap-4 border px-4",
            checked && "border-brand",
            choice.soldOut && "cursor-not-allowed opacity-50",
          )}
        >
          {single ? (
            <Radio id={rowId} value={choice.id} disabled={choice.soldOut} />
          ) : (
            <Checkbox
              id={rowId}
              checked={checked}
              disabled={
                choice.soldOut ||
                // A group that has reached its maximum stops offering more,
                // rather than accepting a selection the backend will reject.
                (!checked && value.length >= group.maxSelectable)
              }
              onCheckedChange={() =>
                onChange(
                  checked
                    ? value.filter((x) => x !== choice.id)
                    : [...value, choice.id],
                )
              }
            />
          )}
          <span className="text-16 text-ink flex-1">{choice.name}</span>
          {choice.priceDelta ? (
            <span className="text-14 text-ink-muted">{choice.priceDelta}</span>
          ) : null}
        </label>
      </li>
    );
  });

  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="flex w-full items-center justify-between gap-4 pb-4">
        <span className="text-16 text-ink font-semibold">{group.name}</span>
        {required ? (
          <span
            className={cn(
              "text-12 rounded-full px-3 py-1.5 font-semibold",
              invalid ? "bg-danger text-ink-inverse" : "bg-brand-tint text-brand",
            )}
          >
            {requiredLabel}
          </span>
        ) : null}
      </legend>

      {single ? (
        <RadioGroupRoot
          value={value[0] ?? ""}
          onValueChange={(next) => onChange([next])}
          aria-required={required || undefined}
        >
          <ul className="flex flex-col gap-2">{rows}</ul>
        </RadioGroupRoot>
      ) : (
        <ul className="flex flex-col gap-2">{rows}</ul>
      )}
    </fieldset>
  );
}
