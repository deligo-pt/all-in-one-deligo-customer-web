"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/Select";
import type { LocationChoice } from "@/services/location/server";

/**
 * The customer's own addresses, beside the address field (Phase 20n).
 *
 * Its own module because of what it imports: Radix's Select put the landing
 * page at **207.7 KB of a 200 KB budget** when it sat inside `LocationForm`,
 * and a guest — who has no saved addresses and never sees this — was paying
 * for it on the first page of the site. Behind `dynamic()` it arrives only for
 * the customers it is for.
 *
 * A Select and not a menu: this chooses a value, and `DropdownMenu`'s own
 * documentation says using a menu for that is its most common misuse.
 */
export function SavedAddressPicker({
  saved,
  label,
  disabled,
  onChoose,
}: {
  saved: readonly LocationChoice[];
  label: string;
  disabled?: boolean;
  onChoose: (id: string) => void;
}) {
  return (
    <Select value="" onValueChange={onChoose} disabled={disabled}>
      <SelectTrigger
        aria-label={label}
        className="h-11 w-auto shrink-0 border-0 bg-transparent ps-2 pe-1"
      >
        <span className="text-14 text-brand font-medium">{label}</span>
      </SelectTrigger>
      <SelectContent className="w-80">
        {saved.map((option) => (
          <SelectItem key={option.id} value={option.id}>
            {option.label ? `${option.label} — ${option.line}` : option.line}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
