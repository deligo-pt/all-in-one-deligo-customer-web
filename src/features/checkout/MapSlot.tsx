import { Icon } from "@/components/ui/Icon";
import { ImageSlot } from "@/components/shared/ImageSlot";

/**
 * Where the map goes — 817×210 at 16px radius, with a pin over it.
 *
 * **It is not Google Maps, and that is a decision rather than a shortcut.**
 * Plan.md §6 lists Maps among the things that must never be in a first paint,
 * and Track B has no API key, no address to centre on and nothing for a marker
 * to mean. Mounting a live map to show a customer their own blank default
 * location would cost the budget a script tag and tell them nothing.
 *
 * So this renders the static image the API supplies for the slot, and a
 * placeholder field with a pin when there is none — the same honesty
 * `ImageSlot` applies everywhere else. Phase 19 replaces the inside of this
 * component with a `dynamic(..., { ssr: false })` map; the slot, its aspect
 * ratio and every caller stay as they are.
 */
export function MapSlot({ src, alt }: { src?: string; alt: string }) {
  return (
    <div className="relative">
      <ImageSlot
        src={src}
        alt={alt}
        sizes="(max-width: 1024px) 100vw, 817px"
        className="rounded-16 aspect-[817/210] w-full"
      />
      <span
        aria-hidden
        className="text-brand absolute inset-0 flex items-center justify-center"
      >
        <Icon name="location" className="size-8" />
      </span>
    </div>
  );
}
