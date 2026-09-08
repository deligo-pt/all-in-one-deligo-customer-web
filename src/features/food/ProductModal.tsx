"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Textarea } from "@/components/ui/Input";
import { ImageSlot } from "@/components/shared/ImageSlot";
import { OptionGroupField } from "./OptionGroupField";
import type { ProductDetail } from "./types";

export type ProductCopy = {
  required: string;
  chooseRequired: string;
  specialInstructions: string;
  specialInstructionsPlaceholder: string;
  addToCart: string;
  quantity: string;
  increase: string;
  decrease: string;
  close: string;
  notWired: string;
};

/**
 * A dish, with everything that has to be decided before it can be ordered.
 *
 * ## The web design does not draw this screen
 *
 * The `add pizza` frames named in Plan.md's Phase 8 turned out to be the
 * **checkout**, five times over, and there is no product-options modal
 * anywhere on the `Deligo website` page. The design does have one — as a
 * *mobile* screen, `add ons` (412×917) with `Section - Choice of Size` beneath
 * it — so the structure, the copy and the states here are the design's, and
 * the desktop layout is an adaptation into the modal container the web design
 * does define. That adaptation is recorded as **D-13**; nothing about it is a
 * measurement and it should be reviewed against a real frame when one exists.
 *
 * From the mobile frame, unchanged: the name beside the price at 20/600; the
 * description at 16/400; option groups with a `REQUIRED` pill; "Special
 * Instructions" over a filled textarea; and a footer holding the quantity
 * stepper and the add button.
 *
 * ## Required groups are enforced here, before the request
 *
 * The backend rejects a line missing a mandatory group and names the group in
 * an error the customer cannot act on. So the modal refuses first, marks the
 * groups that are unsatisfied, and says so once at the bottom — the same rule
 * the old app arrived at, for the same reason.
 *
 * ## Nothing is added yet
 *
 * `/carts/add` is Phase 17's. The button is real, named and blocked by real
 * validation; pressing it reports that the cart is not connected. A button
 * that appeared to work and silently did nothing is the failure this project
 * exists to stop repeating.
 */
export function ProductModal({
  product,
  open,
  onOpenChange,
  copy,
}: {
  product: ProductDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  copy: ProductCopy;
}) {
  const [selection, setSelection] = useState<Record<string, readonly string[]>>({});
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState("");
  const [attempted, setAttempted] = useState(false);

  const unmet = useMemo(
    () =>
      product.options.filter(
        (group) => (selection[group.id]?.length ?? 0) < group.minSelectable,
      ),
    [product.options, selection],
  );

  const blocked = unmet.length > 0;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={product.name}
      closeLabel={copy.close}
      // The design's own modal container is 800 wide; the primitive's default
      // 512 is for confirmations, not for a screen with option groups in it.
      className="w-[min(50rem,calc(100vw-2rem))]"
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-4">
          <QuantityStepper
            value={quantity}
            onChange={setQuantity}
            quantityLabel={copy.quantity}
            increaseLabel={copy.increase}
            decreaseLabel={copy.decrease}
            className="border-line rounded-full border px-3 py-1.5"
          />
          <Button
            shape="pill"
            size="lg"
            onClick={() => setAttempted(true)}
            // Not `disabled`: a button that cannot be pressed cannot explain
            // why. It is pressable, it refuses, and the refusal points at the
            // group that is missing.
            aria-describedby={attempted && blocked ? "product-error" : undefined}
          >
            {copy.addToCart}
            <span className="ps-2 font-semibold">{product.price}</span>
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        <ImageSlot
          src={product.image}
          alt={product.name}
          sizes="(max-width: 800px) 100vw, 752px"
          className="rounded-12 aspect-[16/7] w-full"
        />

        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="text-20 text-ink font-semibold">{product.name}</h3>
            {/* Verbatim. The unit price the API sent, not one multiplied by
                the quantity above — the line total is the cart's to compute
                and the backend's to decide. */}
            <p className="text-20 text-brand font-semibold">{product.price}</p>
          </div>
          {product.description ? (
            <p className="text-16 text-ink-muted">{product.description}</p>
          ) : null}
        </div>

        {product.options.map((group) => (
          <OptionGroupField
            key={group.id}
            group={group}
            value={selection[group.id] ?? []}
            onChange={(next) =>
              setSelection((current) => ({ ...current, [group.id]: next }))
            }
            requiredLabel={copy.required}
            invalid={attempted && unmet.some((g) => g.id === group.id)}
          />
        ))}

        <div className="flex flex-col gap-4">
          <h4 className="text-16 text-ink font-semibold">{copy.specialInstructions}</h4>
          <Textarea
            value={instructions}
            onChange={(event) => setInstructions(event.target.value)}
            aria-label={copy.specialInstructions}
            placeholder={copy.specialInstructionsPlaceholder}
            className="bg-surface-muted rounded-8"
          />
        </div>

        {attempted ? (
          <p
            id="product-error"
            role="status"
            className="text-14 bg-brand-tint text-brand-strong rounded-12 px-4 py-3 font-medium"
          >
            {blocked ? copy.chooseRequired : copy.notWired}
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
