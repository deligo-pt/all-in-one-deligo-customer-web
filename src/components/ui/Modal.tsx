"use client";

import { Dialog } from "radix-ui";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Button } from "./Button";
import { Icon } from "./Icon";

/**
 * The centred dialog. Measured from the design's `Modal Container`: 24px
 * radius, 40px padding, 24px between sections, a 20/600 title.
 *
 * Radix owns everything that is hard and invisible — focus moves into the
 * dialog and is trapped there, the page behind is inert and hidden from
 * assistive technology, Escape closes, scroll is locked, and focus returns to
 * whatever opened it. The design file has 44 modals; writing that behaviour 44
 * times is how 43 of them end up subtly wrong.
 *
 * `title` is required and not optional-with-a-fallback. A dialog with no
 * accessible name is announced as "dialog", which tells a screen-reader user
 * that something has happened and nothing about what.
 */
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  closeLabel,
  footer,
  className,
  children,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  /** Accessible name for the close button — translated by the caller. */
  closeLabel: string;
  footer?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-ink-strong/50 data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out fixed inset-0 z-40" />
        <Dialog.Content
          className={cn(
            // Centred with `inset-0` + `m-auto` rather than a 50% offset and a
            // translate: the transform version needs a physical `left`, which
            // lands the dialog off-screen in a right-to-left document.
            "bg-surface rounded-24 fixed inset-0 z-50 m-auto h-fit w-[min(32rem,calc(100vw-2rem))]",
            "p-10 shadow-lg",
            "data-[state=open]:animate-pop-in data-[state=closed]:animate-pop-out",
            "max-h-[calc(100vh-2rem)] overflow-y-auto",
            className,
          )}
        >
          <div className="flex flex-col gap-6">
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

            {children}
            {footer ? <div className="flex justify-end gap-3">{footer}</div> : null}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export const ModalTrigger = Dialog.Trigger;
export const ModalClose = Dialog.Close;
