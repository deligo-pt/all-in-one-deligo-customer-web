import { ImageSlot } from "@/components/shared/ImageSlot";

export type ComingSoonCopy = {
  badge: string;
  title: string;
  body: string;
  imageAlt: string;
};

/**
 * A vertical the design announces and does not draw — `electronics`, at
 * 1440×940 and 412×917, and nothing behind either.
 *
 * Measured: a full-bleed photograph, a blurred pill at 3% white with a
 * hairline border, "We're Coming Soon." at 60/700 (56, the nearest step) and
 * the line under it at 20/400, all centred and white. The scrim is ours: white
 * text over a desk lamp is legible only where the lamp is not.
 *
 * **Not a placeholder page.** `PagePlaceholder` says a route is unbuilt; this
 * says the product is — which is the design's own sentence, and a true one.
 */
export function ComingSoon({ image, copy }: { image?: string; copy: ComingSoonCopy }) {
  return (
    <section className="relative isolate flex min-h-[calc(100vh-6.875rem)] items-center justify-center overflow-hidden px-8 py-16">
      <ImageSlot
        src={image}
        alt={copy.imageAlt}
        priority
        sizes="100vw"
        className="absolute inset-0 -z-10 size-full"
      />
      <div aria-hidden className="bg-ink-strong/60 absolute inset-0 -z-10" />

      <div className="flex max-w-xl flex-col items-center gap-6 text-center">
        <span className="border-ink-inverse/20 bg-ink-inverse/5 text-13 text-ink-inverse rounded-full border px-6 py-2 font-medium tracking-widest uppercase backdrop-blur">
          {copy.badge}
        </span>
        <h1 className="text-32 text-ink-inverse lg:text-56 font-bold">{copy.title}</h1>
        <p className="text-16 text-ink-inverse lg:text-20">{copy.body}</p>
      </div>
    </section>
  );
}
