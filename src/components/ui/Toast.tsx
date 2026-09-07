"use client";

import { Toaster as SonnerToaster, toast } from "sonner";

/**
 * Transient messages — "Added to cart", "Address saved".
 *
 * Carried from the previous project, which used the same library. What is new
 * is the rule around it: **a toast never carries the only copy of something a
 * customer needs.** It disappears on a timer, it is easy to miss, and it is
 * gone by the time anyone reads it aloud. An error that blocks a purchase
 * belongs next to the field or in the page, not here.
 *
 * `richColors` is deliberately off — the palette is this project's, applied
 * below, so a success toast is DeliGo's green rather than the library's.
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-center"
      // Sonner announces through its own live region. Anything longer than a
      // sentence is not a toast.
      toastOptions={{
        classNames: {
          toast:
            "bg-surface border border-line-subtle rounded-12 shadow-md text-14 text-ink gap-3 p-4",
          title: "font-medium",
          description: "text-12 text-ink-muted",
          actionButton:
            "bg-brand text-ink-inverse rounded-8 text-12 font-medium px-3 py-1.5",
          cancelButton:
            "bg-surface-muted text-ink rounded-8 text-12 font-medium px-3 py-1.5",
          success: "text-success",
          error: "text-danger",
        },
      }}
    />
  );
}

export { toast };
