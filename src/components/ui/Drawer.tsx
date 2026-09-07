"use client";

import { Dialog } from "radix-ui";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Button } from "./Button";
import { Icon } from "./Icon";

/**
 * The edge panel — the design's sign-in flow is one of these on the inline end.
 *
 * Built on the same Radix Dialog as `Modal`, so it inherits the focus trap, the
 * inert background, Escape, and focus restoration. What differs is only where
 * it sits and how it arrives.
 *
 * `--drawer-offset` carries the slide direction. `start` and `end` are logical
 * sides, and the offset flips sign in a right-to-left document, so the panel
 * always slides in from the edge it is attached to rather than from whichever
 * edge was left-to-right when it was written.
 */
export function Drawer({
  open,
  onOpenChange,
  side = "end",
  title,
  description,
  closeLabel,
  className,
  children,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: "start" | "end";
  title: ReactNode;
  description?: ReactNode;
  closeLabel: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-ink-strong/50 data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out fixed inset-0 z-40" />
        <Dialog.Content
          className={cn(
            "bg-surface fixed inset-y-0 z-50 flex w-[min(28rem,100vw)] flex-col gap-6 p-8 shadow-lg",
            "data-[state=open]:animate-slide-in data-[state=closed]:animate-slide-out",
            side === "end"
              ? "end-0 [--drawer-offset:100%] rtl:[--drawer-offset:-100%]"
              : "start-0 [--drawer-offset:-100%] rtl:[--drawer-offset:100%]",
            className,
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <Dialog.Title className="text-20 text-ink-strong font-semibold">
                {title}
              </Dialog.Title>
              {description ? (
                <Dialog.Description className="text-14 text-ink-muted">
                  {description}
                </Dialog.Description>
              ) : null}
            </div>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon-sm" aria-label={closeLabel}>
                <Icon name="close" className="size-4" />
              </Button>
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export const DrawerTrigger = Dialog.Trigger;
export const DrawerClose = Dialog.Close;
