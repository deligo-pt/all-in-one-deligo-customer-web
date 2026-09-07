import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

/**
 * The surface everything on a listing page sits on. Measured from the 96
 * `Product Card` instances: white, 16px radius.
 *
 * `interactive` is separate from "has a link inside it". A card that is itself
 * the click target needs the hover and the cursor; a card containing a link
 * does not, and giving it one makes the whole card look clickable when only
 * part of it is.
 */
export function Card({
  className,
  interactive = false,
  ...props
}: ComponentPropsWithoutRef<"div"> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        "bg-surface border-line-subtle rounded-16 border",
        interactive && "hover:shadow-sm cursor-pointer transition-shadow",
        className,
      )}
      {...props}
    />
  );
}

export function CardBody({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return <div className={cn("p-4", className)} {...props} />;
}
