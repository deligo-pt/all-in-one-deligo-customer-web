"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { MapSlot } from "./MapSlot";

export type LocationCopy = {
  title: string;
  body: string;
  close: string;
  addressLabel: string;
  addressPlaceholder: string;
  locateMe: string;
  confirm: string;
  mapAlt: string;
  notWired: string;
};

/**
 * `Select your exact location` — 800×684 at 20px radius, 40 inside.
 *
 * Measured: a 46px `brand-tint` disc at the head with a `brand-soft` ring, the
 * title at 20/600 over 16/400 in `ink-muted`, a 320px map, a 64px address
 * field at 24px radius with a brand border beside a `Locate me` pill, and a
 * full-width `Confirm Location` above a `line-warm` rule.
 *
 * **`Locate me` does not ask for the customer's location.** A geolocation
 * prompt is a permission dialog, and firing one for a control that cannot do
 * anything with the answer teaches people to deny it — which is a permission
 * you get asked for once. It refuses out loud instead, like everything else in
 * Track B, and Phase 19 makes it real.
 */
export function LocationModal({
  open,
  onOpenChange,
  initial,
  onConfirm,
  copy,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: string;
  onConfirm: (line: string) => void;
  copy: LocationCopy;
}) {
  const [line, setLine] = useState(initial ?? "");
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={copy.title}
      description={copy.body}
      closeLabel={copy.close}
      className="w-[min(50rem,calc(100vw-2rem))]"
    >
      <MapSlot alt={copy.mapAlt} />

      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-64 flex-1">
          <Field label={copy.addressLabel}>
            {(ids) => (
              <Input
                {...ids}
                placeholder={copy.addressPlaceholder}
                value={line}
                startIcon={<Icon name="location" className="size-4" />}
                onChange={(event) => setLine(event.target.value)}
              />
            )}
          </Field>
        </div>
        <Button
          variant="ghost"
          shape="pill"
          className="bg-brand-tint text-brand hover:bg-brand-pale h-14"
          startIcon={<Icon name="my-location" className="size-4" />}
          onClick={() => setNotice(copy.notWired)}
        >
          {copy.locateMe}
        </Button>
      </div>

      <p role="status" className="text-14 text-ink-muted">
        {notice}
      </p>

      <div className="border-line-warm border-t pt-4">
        <Button
          block
          shape="pill"
          className="h-14"
          disabled={line.trim().length === 0}
          onClick={() => onConfirm(line.trim())}
        >
          {copy.confirm}
        </Button>
      </div>
    </Modal>
  );
}
