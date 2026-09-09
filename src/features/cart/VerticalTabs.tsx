import { Chip } from "@/components/ui/Chip";
import type { CartTab, TabId } from "./summary";

/**
 * `All (7) · Food (3) · Groceries (2) · Electronics (2)`.
 *
 * Measured: 36px pills, fully round, 24px of inline padding, 14/500, 16px
 * apart; the active one filled `brand`, the rest outlined in `line`.
 *
 * The tabs are `Chip`s and not a Radix `Tabs`, and that is the accessibility
 * decision rather than a bundle one. Tab semantics promise that the panels are
 * alternatives and that only the selected one exists; this row filters a list
 * that stays a list, and every store is still a heading in the same document.
 * Announcing it as a tablist would describe a widget the page does not have.
 */
export function VerticalTabs({
  tabs,
  active,
  onSelect,
  label,
}: {
  tabs: readonly CartTab[];
  active: TabId;
  onSelect: (id: TabId) => void;
  label: string;
}) {
  return (
    <div className="flex flex-wrap gap-4" role="group" aria-label={label}>
      {tabs.map((tab) => (
        <Chip
          key={tab.id}
          selected={tab.id === active}
          onClick={() => onSelect(tab.id)}
        >
          {tab.label}
        </Chip>
      ))}
    </div>
  );
}
