"use client";

import { Button } from "@/components/ui/Button";
import { SUPPORT_EVENT, type SupportIntent } from "@/lib/events";

/**
 * A button that opens the support panel with a sentence already typed
 * (Phase 20h).
 *
 * It does not navigate and it does not own the panel: it dispatches
 * {@link SUPPORT_EVENT}, which the one panel mounted in the locale layout
 * answers. That is the whole point of the phase — a customer whose payment
 * just failed asks about it from the page that told them, and the page is
 * still there when the dialog closes.
 *
 * `prefill` arrives already translated. It is the same sentence the topic rows
 * build, because `category` on a support ticket is write-once and ignored on
 * every conversation after the first: the words are what reaches a person.
 */
export function SupportOpener({
  label,
  prefill,
  variant = "secondary",
}: {
  label: string;
  prefill?: string;
  variant?: "primary" | "secondary" | "ghost";
}) {
  return (
    <Button
      variant={variant}
      onClick={() =>
        window.dispatchEvent(
          new CustomEvent<SupportIntent>(SUPPORT_EVENT, { detail: { prefill } }),
        )
      }
    >
      {label}
    </Button>
  );
}
