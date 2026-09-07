"use client";

import { Avatar as RadixAvatar } from "radix-ui";
import { cn } from "@/lib/cn";

/**
 * A person or a vendor, as a circle.
 *
 * Radix handles the part that is easy to get wrong: the fallback appears only
 * after the image has actually failed or is still loading, so there is no flash
 * of initials over a picture that was going to arrive anyway.
 *
 * `alt` is required. An avatar with no name is an unlabelled image, and the
 * name is almost always already to hand.
 */
export function Avatar({
  src,
  alt,
  fallback,
  className,
}: {
  src?: string | null;
  alt: string;
  /** Shown while the image loads or when there is none — initials, usually. */
  fallback: string;
  className?: string;
}) {
  return (
    <RadixAvatar.Root
      className={cn(
        "bg-surface-muted relative flex size-10 shrink-0 overflow-hidden rounded-full",
        className,
      )}
    >
      {src ? (
        <RadixAvatar.Image src={src} alt={alt} className="size-full object-cover" />
      ) : null}
      <RadixAvatar.Fallback
        delayMs={src ? 300 : 0}
        className="text-14 text-ink-muted flex size-full items-center justify-center font-medium"
      >
        {fallback}
      </RadixAvatar.Fallback>
    </RadixAvatar.Root>
  );
}
