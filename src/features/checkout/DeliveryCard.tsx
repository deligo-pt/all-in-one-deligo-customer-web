import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { MapSlot } from "./MapSlot";
import type { DeliveryAddress } from "./types";

export type DeliveryCopy = {
  title: string;
  edit: string;
  noAddress: string;
  mapAlt: string;
  instructionTitle: string;
  instructionPlaceholder: string;
};

/**
 * Where it is going, and anything the courier needs to know.
 *
 * Measured: 865 wide at 24px radius over a `line` border, 34/24 inside, 16
 * between; the heading at 20/600 above the address at 16/400 in `ink-muted`
 * with a map glyph; `Edit` at 16/500 in brand on the far right; then the map
 * at 817×210; then `Delivery Instruction` at 16/600 over a `surface-muted`
 * field at 8px radius.
 *
 * The instruction placeholder is the **same string** the dish modal already
 * uses — "Any allergies or special requests? Let us know here..." — and it is
 * the same dictionary key, not a second copy of the sentence. The design
 * repeats it verbatim in both places.
 *
 * With no address there is no `Edit`: there is nothing to edit. The button
 * becomes the one that sets one, which is the same control the location modal
 * opens either way.
 */
export function DeliveryCard({
  address,
  instruction,
  onInstructionChange,
  onEditAddress,
  copy,
}: {
  address?: DeliveryAddress;
  instruction: string;
  onInstructionChange: (next: string) => void;
  onEditAddress: () => void;
  copy: DeliveryCopy;
}) {
  return (
    <section className="border-line rounded-24 bg-surface flex flex-col gap-4 border px-6 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-20 text-ink font-semibold">{copy.title}</h2>
          <p className="text-16 text-ink-muted flex items-center gap-2">
            <Icon name="map" className="size-4 shrink-0" />
            {address?.line ?? copy.noAddress}
          </p>
        </div>
        <Button variant="link" className="text-16 font-medium" onClick={onEditAddress}>
          {copy.edit}
        </Button>
      </div>

      <MapSlot src={address?.mapImage} alt={copy.mapAlt} />

      <div className="flex flex-col gap-2">
        <h3 className="text-16 text-ink font-semibold">{copy.instructionTitle}</h3>
        <textarea
          rows={3}
          value={instruction}
          onChange={(event) => onInstructionChange(event.target.value)}
          aria-label={copy.instructionTitle}
          placeholder={copy.instructionPlaceholder}
          className="border-line rounded-8 bg-surface-muted text-14 text-ink placeholder:text-ink-muted w-full resize-none border p-4"
        />
      </div>
    </section>
  );
}
