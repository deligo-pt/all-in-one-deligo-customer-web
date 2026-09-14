import Image from "next/image";
import { shouldOptimiseImage } from "@/lib/imageHosts";
import { cn } from "@/lib/cn";

/**
 * Where a photograph goes.
 *
 * The design's imagery is watermarked Adobe Stock comps (decision D-5), so
 * none of it ships. Rather than leave holes, every image position renders a
 * token-coloured field at the right aspect ratio — obviously a placeholder,
 * which is the point: an almost-right image is harder to notice than an empty
 * one, and the almost-right one is the kind that reaches production.
 *
 * When the licensed files arrive, one `src` prop per slot is the whole change.
 * With a `src` this is a `next/image` with a real `alt`; without one it is
 * decoration and is hidden from assistive technology, because announcing
 * "A DeliGo courier delivering an order" for a pink rectangle is a lie told to
 * the people least able to check it.
 */
export function ImageSlot({
  src,
  alt,
  priority,
  sizes,
  tone = "tint",
  className,
}: {
  src?: string;
  /** Used only when there is an image. Kept required so the day a `src` is
   *  added, the alt is already written. */
  alt: string;
  priority?: boolean;
  sizes?: string;
  tone?: "tint" | "brand";
  className?: string;
}) {
  if (src) {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes ?? "100vw"}
          unoptimized={!shouldOptimiseImage(src)}
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className={cn(
        "overflow-hidden",
        tone === "brand"
          ? "from-brand-strong to-brand-deep bg-linear-to-br"
          : "from-brand-tint to-brand-soft bg-linear-to-br",
        className,
      )}
    />
  );
}
